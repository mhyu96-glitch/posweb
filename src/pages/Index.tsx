"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SalesEntryForm } from "@/components/SalesEntryForm";
import { SalesSummary } from "@/components/SalesSummary";
import { SalesHistoryTable, Sale } from "@/components/SalesHistoryTable";
import { ReportFilters } from "@/components/ReportFilters";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt } from "@/components/Receipt";
import { isSameDay, isSameMonth, isSameYear } from "date-fns";
import { SalesChart } from "@/components/SalesChart";
import { Input } from "@/components/ui/input";

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [receiptToPrint, setReceiptToPrint] = useState<Sale | null>(null);
  const [filter, setFilter] = useState<{
    mode: "all" | "daily" | "monthly" | "yearly";
    value?: { date?: Date; month?: number; year?: number };
  }>({ mode: "all" });
  const [searchTerm, setSearchTerm] = useState("");

  const [initialBalance, setInitialBalance] = useState(() => {
    const savedBalance = localStorage.getItem("initialBalance");
    return savedBalance ? parseFloat(savedBalance) : 0;
  });

  useEffect(() => {
    localStorage.setItem("initialBalance", initialBalance.toString());
  }, [initialBalance]);

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
      return data.map(sale => ({ ...sale, createdAt: new Date(sale.created_at) }));
    },
    enabled: !!session?.user?.id,
  });

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    const { mode, value } = filter;

    let dateFilteredSales = sales;
    if (mode === "daily") {
      if (!value?.date) return [];
      dateFilteredSales = sales.filter(sale => isSameDay(sale.createdAt, value.date!));
    } else if (mode === "monthly" && value?.month && value?.year) {
      dateFilteredSales = sales.filter(sale => 
        isSameMonth(sale.createdAt, new Date(value.year!, value.month! - 1)) &&
        isSameYear(sale.createdAt, new Date(value.year!, value.month! - 1))
      );
    } else if (mode === "yearly" && value?.year) {
      dateFilteredSales = sales.filter(sale => isSameYear(sale.createdAt, new Date(value.year!, 0)));
    }

    if (!searchTerm) {
      return dateFilteredSales;
    }

    return dateFilteredSales.filter(sale => {
      const nameMatch = sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const phoneMatch = sale.phone.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || phoneMatch;
    });
  }, [sales, filter, searchTerm]);

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

  const handlePrintReceipt = (sale: Sale) => {
    setReceiptToPrint(sale);
  };

  useEffect(() => {
    if (receiptToPrint) {
      const timer = setTimeout(() => window.print(), 100);
      return () => clearTimeout(timer);
    }
  }, [receiptToPrint]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setReceiptToPrint(null);
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const totalSalesAmount = filteredSales?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
  const totalAdminFee = filteredSales?.reduce((sum, sale) => sum + (sale.admin_fee || 0), 0) || 0;
  
  const previousCustomers = sales
    ? Array.from(
        sales
          .reduce((map, sale) => {
            if (sale.customer_name) {
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

  if (receiptToPrint) {
    return (
      <div id="receipt-print-area">
        <Receipt sale={receiptToPrint} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="text-center mb-8 relative print:hidden">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Catatan Penjualan Harian
        </h1>
        <p className="text-muted-foreground mt-2">
          Aplikasi pencatatan penjualan Toko Izzah
        </p>
        <Button onClick={handleLogout} variant="outline" className="absolute top-0 right-0">
          Logout
        </Button>
      </header>

      <main className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:hidden">
          <div className="lg:col-span-1">
            <SalesEntryForm onAddSale={handleAddSale} previousCustomers={previousCustomers} />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <SalesChart sales={sales || []} />
            <SalesSummary
              title="Ringkasan Penjualan"
              description="Ringkasan penjualan berdasarkan filter yang dipilih."
              totalSalesAmount={totalSalesAmount}
              totalAdminFee={totalAdminFee}
              initialBalance={initialBalance}
              onSetInitialBalance={setInitialBalance}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold">Laporan Penjualan</h2>
            <div className="w-full md:w-auto md:max-w-sm">
              <Input
                placeholder="Cari nama atau nomor HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ReportFilters 
            onFilterChange={(mode, value) => setFilter({ mode, value })}
            onClearFilters={() => setFilter({ mode: "all" })}
          />
        </div>

        <div className="w-full">
          {isSalesLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <SalesHistoryTable sales={filteredSales || []} onPrintReceipt={handlePrintReceipt} />
          )}
        </div>
      </main>

      <footer className="mt-12 print:hidden">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;