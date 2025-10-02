"use client";

import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useShift } from "@/components/ShiftProvider";
import { showError } from "@/utils/toast";

const Login = () => {
  const navigate = useNavigate();
  const { startShift, activeShift } = useShift();
  
  // State for Cashier Login
  const [cashierUsername, setCashierUsername] = useState("");
  const [cashierPassword, setCashierPassword] = useState("");
  const [startingBalance, setStartingBalance] = useState("");

  // State for Admin Login
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (activeShift) {
          navigate("/");
        } else {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
          if (profile?.role === 'admin') {
            navigate("/");
          }
        }
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // If user logs out from another tab, ensure they are on the login page
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, activeShift]);

  const handleCashierLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const email = `${cashierUsername.toLowerCase()}@kasir.local`;
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: cashierPassword });
      if (signInError) throw signInError;

      const balance = parseFloat(startingBalance.replace(/\./g, '')) || 0;
      await startShift(balance);
      navigate("/");
    } catch (error: any) {
      showError(error.message || "Gagal memulai shift. Periksa kembali username dan password Anda.");
      supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const email = `${adminUsername.toLowerCase()}@kasir.local`;
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({ email, password: adminPassword });
      if (signInError) throw signInError;
      if (!user) throw new Error("Login gagal, pengguna tidak ditemukan.");

      const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profileError) throw profileError;

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error("Akses ditolak. Akun ini bukan akun admin.");
      }
      
      navigate("/");
    } catch (error: any) {
      showError(error.message || "Login admin gagal. Periksa kembali username dan password Anda.");
      supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (value: string) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(Number(value));
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartingBalance(e.target.value.replace(/[^\d]/g, ""));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Tabs defaultValue="cashier" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cashier">Login Kasir</TabsTrigger>
          <TabsTrigger value="admin">Login Admin</TabsTrigger>
        </TabsList>
        <TabsContent value="cashier">
          <Card>
            <CardHeader>
              <CardTitle>Mulai Shift Baru</CardTitle>
              <CardDescription>Masukkan detail Anda untuk memulai sesi penjualan.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCashierLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cashier-username">Username</Label>
                  <Input id="cashier-username" type="text" placeholder="kasir01" required value={cashierUsername} onChange={(e) => setCashierUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cashier-password">Password</Label>
                  <Input id="cashier-password" type="password" required value={cashierPassword} onChange={(e) => setCashierPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="starting-balance">Saldo Awal Kas (Rp)</Label>
                  <Input id="starting-balance" type="text" inputMode="numeric" placeholder="Contoh: 500000" value={formatCurrency(startingBalance)} onChange={handleBalanceChange} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memulai..." : "Mulai Shift"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Selamat Datang, Admin</CardTitle>
              <CardDescription>Gunakan akun admin Anda untuk mengakses dasbor penuh.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Username</Label>
                  <Input id="admin-username" type="text" placeholder="admin" required value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input id="admin-password" type="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Masuk..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;