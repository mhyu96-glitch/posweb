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
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt } from "@/components/Receipt";
import { isSameMonth, isSameYear, startOfDay, endOfDay } from "date-fns";
import { SalesChart } from "@/components/SalesChart";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { useShift } from "@/components/ShiftProvider";

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeShift, isLoading: isShiftLoading } = useShift();
  const [receiptToPrint, setReceiptToPrint] = useState<Sale | null>(null);
  const [filter, setFilter] = useState<{
    mode: "all" | "daily" | "monthly" | "yearly";
    value?: { dateRange?: DateRange; month?: number; year?: number };
  }>({ mode: "all" });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [initialBalance, setInitialBalance] = useState(() => {
    const savedBalance = localStorage.getItem("initialBalance");
    return savedBalance ? parseFloat(savedBalance) : 0;
  });

  useEffect(() => {
    if (activeShift) {
      setInitialBalance(activeShift.starting_balance);
    }
  }, [activeShift]);

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
    queryKey: ["sales", session?.user?.id, activeShift?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      let query = supabase.from("sales").select("*");
      
      // If cashier is on shift, only show sales for that shift
      if (activeShift) {
        query = query.eq("shift_id", activeShift.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(sale => ({ ...sale, createdAt: new Date(sale.created_at) }));
    },
    enabled: !!session?.user?.id && !isShiftLoading,
  });

  const uniqueCategories = useMemo(() => {
    if (!sales) return [];
    const categories = new Set(sales.map(sale => sale.category).filter(Boolean) as string[]);
    return Array.from(categories);
  }, [sales]);

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    const { mode, value } = filter;

    let dateFilteredSales = sales;
    if (mode === "daily") {
      if (value?.dateRange?.from) {
        const from = startOfDay(value.dateRange.from);
        const to = value.dateRange.to ? endOfDay(value.dateRange.to) : endOfDay(value.dateRange.from);
        dateFilteredSales = sales.filter(sale => sale.createdAt >= from && sale.createdAt <= to);
      } else {
        return [];
      }
    } else if (mode === "monthly" && value?.month && value?.year) {
      dateFilteredSales = sales.filter(sale => 
        isSameMonth(sale.createdAt, new Date(value.year!, value.month! - 1)) &&
        isSameYear(sale.createdAt, new Date(value.year!, value.month! - 1))
      );
    } else if (mode === "yearly" && value?.year) {
      dateFilteredSales = sales.filter(sale => isSameYear(sale.createdAt, new Date(value.year!, 0)));
    }

    let categoryFilteredSales = dateFilteredSales;
    if (categoryFilter) {
      categoryFilteredSales = dateFilteredSales.filter(sale => sale.category === categoryFilter);
    }

    if (!searchTerm) {
      return categoryFilteredSales;
    }

    return categoryFilteredSales.filter(sale => {
      const nameMatch = sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const phoneMatch = sale.phone?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || phoneMatch;
    });
  }, [sales, filter, searchTerm, categoryFilter]);

  const handleAddSale = async (newSale: { name: string; destination: string; bankName?: string; amount: number; adminFee: number; category: string; }) => {
    if (!session?.user?.id) {
      showError("Anda harus login untuk mencatat penjualan.");
      return;
    }
    try {
      const { error } = await supabase
        .from("sales")
        .insert([{ 
          customer_name: newSale.name, 
          phone: newSale.destination, 
          bank_name: newSale.bankName,
          amount: newSale.amount, 
          admin_fee: newSale.adminFee,
          category: newSale.category,
          user_id: session.user.id,
          shift_id: activeShift?.id,
        }]);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["sales", session.user.id, activeShift?.id] });
    } catch (error) {
      showError("Gagal menyimpan penjualan.");
      console.error("Error adding sale:", error);
    }
  };

  const handleDeleteSale = async (saleId: string | number) => {
    try {
      const { error } = await supabase.from("sales").delete().match({ id: saleId });
      if (error) throw error;
      showSuccess("Transaksi berhasil dihapus!");
      queryClient.invalidateQueries({ queryKey: ["sales", session.user.id, activeShift?.id] });
    } catch (error) {
      showError("Gagal menghapus transaksi.");
    }
  };

  const handlePrintReceipt = (sale: Sale) => setReceiptToPrint(sale);

  const handleExportCSV = () => {
    if (!filteredSales || filteredSales.length === 0) {
      showError("Tidak ada data untuk diekspor.");
      return;
    }
    const headers = ["Waktu Transaksi", "Nama Pelanggan", "Detail Tujuan", "Kategori", "Nominal (Rp)", "Admin (Rp)", "Total (Rp)"];
    const rows = filteredSales.map(s => [
      `"${s.createdAt.toLocaleString("id-ID", { hour12: false })}"`, `"${s.customer_name || "-"}"`,
      `"${s.bank_name ? `${s.bank_name} - ${s.phone}` : s.phone || "-"}"`, `"${s.category || "-"}"`,
      s.amount, s.admin_fee || 0, s.amount + (s.admin_fee || 0),
    ].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `laporan_penjualan_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("Laporan berhasil diekspor!");
  };

  useEffect(() => {
    if (receiptToPrint) {
      const timer = setTimeout(() => window.print(), 100);
      return () => clearTimeout(timer);
    }
  }, [receiptToPrint]);

  useEffect(() => {
    const handleAfterPrint = () => setReceiptToPrint(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const totalSalesAmount = filteredSales?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
  const totalAdminFee = filteredSales?.reduce((sum, sale) => sum + (sale.admin_fee || 0), 0) || 0;
  
  const previousCustomers = useMemo(() => sales
    ? Array.from(sales.reduce((map, sale) => {
        if (sale.customer_name) map.set(sale.customer_name, { name: sale.customer_name });
        return map;
      }, new Map<string, { name: string }>()).values())
    : [], [sales]);

  if (isSessionLoading || isSalesLoading || isShiftLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (receiptToPrint) {
    return <div id="receipt-print-area"><Receipt sale={receiptToPrint} /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <main className="space-y-8">
        <div className="print:hidden">
          {isSalesLoading ? <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : <DashboardMetrics sales={sales || []} />}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:hidden">
          <div className="lg:col-span-1">
            <SalesEntryForm onAddSale={handleAddSale} previousCustomers={previousCustomers} />
          </div>
          <div className="lg:col-span-2">
            <SalesSummary title="Ringkasan Penjualan" description="Ringkasan penjualan berdasarkan filter yang dipilih." totalSalesAmount={totalSalesAmount} totalAdminFee={totalAdminFee} initialBalance={initialBalance} onSetInitialBalance={setInitialBalance} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold">Laporan Penjualan</h2>
            <div className="w-full md:w-auto md:max-w-sm">
              <Input placeholder="Cari nama atau detail tujuan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <ReportFilters onFilterChange={(mode, value) => setFilter({ mode, value })} onClearFilters={() => { setFilter({ mode: "all" }); setCategoryFilter(""); }} onCategoryChange={setCategoryFilter} categories={uniqueCategories} />
        </div>
        <div className="w-full">
          {isSalesLoading ? <Skeleton className="h-96 w-full" /> : <SalesHistoryTable sales={filteredSales || []} onPrintReceipt={handlePrintReceipt} onDeleteSale={handleDeleteSale} onExportCSV={handleExportCSV} />}
        </div>
        <div className="print:hidden"><SalesChart sales={sales || []} /></div>
      </main>
      <footer className="mt-12 print:hidden"><MadeWithDyad /></footer>
    </div>
  );
};

export default Index;