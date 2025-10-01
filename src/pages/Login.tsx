"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [startingBalance, setStartingBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (activeShift) {
          navigate("/");
        } else {
          // If logged in but no shift, check role
          const { data: profile } = await supabase.from('profiles').select('role').single();
          if (profile?.role === 'admin') {
            navigate("/");
          }
        }
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // For admin login via Auth component
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, activeShift]);

  const handleCashierLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Construct the internal email from the username
      const email = `${username.toLowerCase()}@kasir.local`;
      
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const balance = parseFloat(startingBalance.replace(/\./g, '')) || 0;
      await startShift(balance);
      navigate("/");
    } catch (error: any) {
      showError(error.message || "Gagal memulai shift. Periksa kembali username dan password Anda.");
      supabase.auth.signOut(); // Ensure user is logged out on failure
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
                  <Input id="cashier-username" type="text" placeholder="kasir01" required value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cashier-password">Password</Label>
                  <Input id="cashier-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
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
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={[]}
                theme="light"
                view="sign_in"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;