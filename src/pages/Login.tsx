"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Login = () => {
  const navigate = useNavigate();

  const { data: { session } = { session: null }, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return <div>Memuat...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Login ke Dasbor Penjualan
        </h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: "Alamat Email",
                password_label: "Kata Sandi",
                button_label: "Masuk",
                social_provider_text: "Masuk dengan {{provider}}",
                link_text: "Sudah punya akun? Masuk",
              },
              sign_up: {
                email_label: "Alamat Email",
                password_label: "Kata Sandi",
                button_label: "Daftar",
                social_provider_text: "Daftar dengan {{provider}}",
                link_text: "Belum punya akun? Daftar",
              },
              forgotten_password: {
                email_label: "Alamat Email",
                button_label: "Kirim instruksi reset",
                link_text: "Lupa kata sandi?",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;