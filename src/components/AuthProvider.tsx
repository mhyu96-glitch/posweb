"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  profile: { role: string } | null;
  isProfileLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fungsi ini secara proaktif memeriksa sesi saat aplikasi pertama kali dimuat.
    // Ini adalah langkah paling penting untuk mencegah race condition.
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);

        if (initialSession?.user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', initialSession.user.id)
            .single();
          if (error && error.code !== 'PGRST116') throw error;
          setProfile(data);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error during initial session fetch:", error);
        setSession(null);
        setProfile(null);
      } finally {
        // Pastikan loading selesai HANYA setelah semua pengecekan awal selesai.
        setIsLoading(false);
      }
    };

    initializeSession();

    // Setelah pengecekan awal, kita baru mendengarkan perubahan di masa mendatang.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        // Saat ada perubahan (login/logout), kita tidak lagi dalam status loading awal.
        setIsLoading(true);
        if (newSession?.user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', newSession.user.id)
            .single();
          if (error && error.code !== 'PGRST116') console.error("Error fetching profile on auth change:", error);
          setProfile(data);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    isLoading,
    profile,
    isProfileLoading: isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};