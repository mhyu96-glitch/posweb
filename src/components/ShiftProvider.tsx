"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export interface Shift {
  id: string;
  start_time: string;
  starting_balance: number;
}

interface ShiftContextType {
  activeShift: Shift | null;
  isLoading: boolean;
  startShift: (startingBalance: number) => Promise<void>;
  endShift: () => Promise<string | null>;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider = ({ children }: { children: ReactNode }) => {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkForActiveShift = async () => {
      if (!session?.user) {
        setActiveShift(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("shifts")
          .select("id, start_time, starting_balance")
          .eq("user_id", session.user.id)
          .is("end_time", null)
          .single();

        if (error && error.code !== "PGRST116") { // PGRST116: no rows found
          throw error;
        }
        setActiveShift(data);
      } catch (error) {
        console.error("Error checking for active shift:", error);
        setActiveShift(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkForActiveShift();
  }, [session]);

  const startShift = async (startingBalance: number) => {
    if (activeShift) throw new Error("Shift sudah aktif.");
    if (!session?.user?.id) throw new Error("Pengguna tidak login.");

    const { data, error } = await supabase
      .from("shifts")
      .insert({ 
        starting_balance: startingBalance,
        user_id: session.user.id // PERBAIKAN: Secara eksplisit mengatur pemilik shift
      })
      .select("id, start_time, starting_balance")
      .single();

    if (error) throw error;
    setActiveShift(data);
  };

  const endShift = async (): Promise<string | null> => {
    if (!activeShift) return null;

    const shiftIdToEnd = activeShift.id;

    const { error } = await supabase
      .from("shifts")
      .update({ end_time: new Date().toISOString() })
      .eq("id", shiftIdToEnd);

    if (error) throw error;
    setActiveShift(null);
    return shiftIdToEnd;
  };

  return (
    <ShiftContext.Provider value={{ activeShift, isLoading, startShift, endShift }}>
      {children}
    </ShiftContext.Provider>
  );
};

export const useShift = () => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error("useShift must be used within a ShiftProvider");
  }
  return context;
};