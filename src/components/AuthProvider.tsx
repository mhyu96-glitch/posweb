"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean; // This now ONLY tracks the initial session check
  profile: { role: string } | null;
  isProfileLoading: boolean; // A separate state for profile fetching
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    // 1. Proactively check for the session ONCE on initial load.
    // This is the fastest way to determine if the user is logged in.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsSessionLoading(false);
    });

    // 2. Set up a listener for any FUTURE changes (SIGN_IN, SIGN_OUT).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // This effect is solely responsible for fetching the profile whenever the session changes.
    // It runs independently of the session loading.
    if (session?.user?.id) {
      setIsProfileLoading(true);
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
          setIsProfileLoading(false);
        });
    } else {
      // No session, so no profile.
      setProfile(null);
      setIsProfileLoading(false);
    }
  }, [session]);

  const value = {
    session,
    isLoading: isSessionLoading,
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