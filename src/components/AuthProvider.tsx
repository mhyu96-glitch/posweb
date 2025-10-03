"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  profile: { role: string } | null;
  isLoading: boolean; // Sinyal loading gabungan untuk sesi DAN profil
  isProfileLoading: boolean; // Status loading spesifik untuk profil
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    // 1. Cek sesi saat aplikasi pertama kali dimuat.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsSessionLoading(false);
    });

    // 2. Dengarkan perubahan status otentikasi di masa mendatang.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Jika sesi berubah (misalnya, logout lalu login lagi), kita harus mengambil ulang profil.
      setIsProfileLoading(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Efek ini HANYA bertanggung jawab untuk mengambil data profil.
    // Ini berjalan setiap kali sesi berubah.
    if (session?.user?.id) {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== 'PGRST116') {
            console.error("Error fetching profile:", error);
            setProfile(null);
          } else {
            setProfile(data);
          }
          // Selesai mengambil profil.
          setIsProfileLoading(false);
        });
    } else {
      // Jika tidak ada sesi, tidak ada profil yang perlu diambil.
      setProfile(null);
      setIsProfileLoading(false);
    }
  }, [session]);

  const value = {
    session,
    profile,
    // INI ADALAH PERUBAHAN KUNCI:
    // Aplikasi dianggap sedang loading jika sesi BELUM dicek ATAU profil BELUM diambil.
    isLoading: isSessionLoading || isProfileLoading,
    isProfileLoading: isProfileLoading,
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