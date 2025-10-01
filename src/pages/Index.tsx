"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesEntryForm } from "@/components/SalesEntryForm";
import { DailySummary } from "@/components/DailySummary";
import { SalesHistoryTable, Sale } from "@/components/SalesHistoryTable";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [initialBalance, setInitialBalance] = useState(0);

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) {
        navigate("/login");
        return null;
      }
      return data.session;
    },
    staleTime: Infinity,
  });

  const { data: sales, isLoading: isSalesLoading } = useQuery<Sale[]>({
    queryKey: ["sales", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Mengonversi created_at menjadi objek Date
      return data.map(sale => ({ ...sale, createdAt: new Date(sale.created_at) }));
    },
    enabled: !!session?.user?.id,
  });

  const handleAddSale = async (newSale: { name: string; phone: string; amount: number; adminFee: number }) => {
    if (!session?.user?.id) {
      showError("Anda harus login untuk mencatat penjualan.");
      return;
    }
    try {
      const { error } = await supabase
        .from("sales")
        .insert([{ 
          customer_name: newSale.name, 
          phone: newSale.phone, 
          amount: newSale.amount, 
          admin_fee: newSale.adminFee,
          user_id: session.user.id 
        }]);
      if (error) throw error;
      showSuccess("Penjualan berhasil dicatat!");
      queryClient.invalidateQueries({ queryKey: ["sales", session.user.id] });
    } catch (error) {
      showError("Gagal menyimpan penjualan.");
      console.error("Error adding sale:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate("/login");
  };

  const totalSalesAmount = sales?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
  const totalAdminFee = sales?.reduce((sum, sale) => sum + (sale.admin_fee || 0), 0) || 0;
  
  const previousCustomers = sales
    ? Array.from(
        sales
          .reduce((map, sale) => {
            if (sale.customer_name) {
              // Karena data sudah diurutkan dari yang terbaru, kita hanya ambil entri pertama untuk setiap nama
              if (!map.has(sale.customer_name)) {
                map.set(sale.customer_name, { name: sale.customer_name, phone: sale.phone });
              }
            }
            return map;
          }, new Map<string, { name: string; phone: string }>())
          .values()
      )
    : [];

  if (isSessionLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Skeleton className="h-12 w-1/2 mx-auto mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="text-center mb-8 relative">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Catatan Penjualan Harian
        </h1>
        <p className="text-muted-foreground mt-2">
          Aplikasi sederhana untuk mencatat penjualan Anda.
        </p>
        <Button onClick={handleLogout} variant="outline" className="absolute top-0 right-0">
          Logout
        </Button>
      </header>

      <main className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <SalesEntryForm onAddSale={handleAddSale} previousCustomers={previousCustomers} />
          </div>
          <div className="lg:col-span-2">
            <DailySummary
              totalSalesAmount={totalSalesAmount}
              totalAdminFee={totalAdminFee}
              initialBalance={initialBalance}
              onSetInitialBalance={setInitialBalance}
            />
          </div>
        </div>

        <div className="w-full">
          {isSalesLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <SalesHistoryTable sales={sales || []} />
          )}
        </div>
      </main>

      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;