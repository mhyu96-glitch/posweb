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
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    // 1. Lakukan pengecekan sesi awal secara langsung saat komponen dimuat.
    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
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
        // Pastikan loading selesai setelah pengecekan awal.
        setIsLoading(false);
        setIsProfileLoading(false);
      }
    };

    initializeSession();

    // 2. Siapkan listener untuk memantau perubahan status otentikasi di masa mendatang.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session?.user?.id) {
        setIsProfileLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (error && error.code !== 'PGRST116') console.error("Error fetching profile on auth change:", error);
        setProfile(data);
        setIsProfileLoading(false);
      } else {
        setProfile(null);
        setIsProfileLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    isLoading,
    profile,
    isProfileLoading,
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