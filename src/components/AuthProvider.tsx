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
    // 1. Handle the initial session check on application startup.
    // This is the most important step to prevent race conditions.
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
        // This is the ONLY place where the initial loading state is set to false.
        setIsLoading(false);
      }
    };

    initializeSession();

    // 2. Set up a listener for future authentication changes (login, logout).
    // This listener does NOT handle the initial loading state.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        
        // When the session changes, we need to refetch the profile.
        if (newSession?.user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', newSession.user.id)
            .single();
          if (error && error.code !== 'PGRST116') {
            console.error("Error fetching profile on auth change:", error);
            setProfile(null);
          } else {
            setProfile(data);
          }
        } else {
          setProfile(null);
        }
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
    isProfileLoading: isLoading, // The profile is considered loading whenever the main auth state is.
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