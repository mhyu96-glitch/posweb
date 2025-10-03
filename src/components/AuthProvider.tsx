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
    // onAuthStateChange fires an initial event with the session when the listener is set up.
    // This handles both initial session restoration and subsequent auth events.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session?.user?.id) {
        // If there's a session, fetch the user's profile.
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching profile:", error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } else {
        // If there's no session, clear the profile.
        setProfile(null);
      }
      
      // Set loading to false only after the session and profile are fully resolved.
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    isLoading,
    profile,
    // Tie profile loading directly to the main loading state for simplicity and robustness.
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