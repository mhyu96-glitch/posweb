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
import { CategoryChart } from "@/components/CategoryChart";
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

  const { data: settings } = useQuery({
    queryKey: ["settings", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("settings")
        .select("shop_name, shop_address, shop_phone")
        .eq("user_id", session.user.id)
        .single();
      if (error && error.code !== "PGRST116") console.error(error);
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: sales, isLoading: isSalesLoading } = useQuery<Sale[]>({
    queryKey: ["sales", session?.user?.id, activeShift?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      let query = supabase.from("sales").select("*, products(name)");
      
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
      const productMatch = sale.products?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || phoneMatch || productMatch;
    });
  }, [sales, filter, searchTerm, categoryFilter]);

  const handleAddSale = async (newSale: { name: string; destination: string; bankName?: string; amount: number; adminFee: number; category: string; productId?: string; }) => {
    if (!session?.user?.id || !activeShift?.id) {
      showError("Tidak ada shift aktif. Tidak dapat mencatat penjualan.");
      return;
    }
    try {
      const { error } = await supabase.from("sales").insert([{ 
        user_id: session.user.id, customer_name: newSale.name, phone: newSale.destination, 
        bank_name: newSale.bankName, amount: newSale.amount, admin_fee: newSale.adminFee,
        category: newSale.category, shift_id: activeShift.id, product_id: newSale.productId,
      }]);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["sales", session.user.id, activeShift?.id] });
    } catch (error) {
      showError("Gagal menyimpan penjualan.");
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
    const headers = ["Waktu Transaksi", "Produk", "Nama Pelanggan", "Detail Tujuan", "Kategori", "Nominal (Rp)", "Admin (Rp)", "Total (Rp)"];
    const rows = filteredSales.map(s => [
      `"${s.createdAt.toLocaleString("id-ID", { hour12: false })}"`, `"${s.products?.name || "-"}"`, `"${s.customer_name || "-"}"`,
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
        <Skeleton className="h-8 w-1/ter" />
        <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (receiptToPrint) {
    return <div id="receipt-print-area"><Receipt sale={receiptToPrint} settings={settings} /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <main className="space-y-8">
        <div className="print:hidden">
          <DashboardMetrics sales={sales || []} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start print:hidden">
          <div className="lg:col-span-1">
            <SalesEntryForm onAddSale={handleAddSale} previousCustomers={previousCustomers} userId={session?.user?.id || ""} />
          </div>
          <div className="lg:col-span-2">
            <SalesSummary title="Ringkasan Penjualan" description="Ringkasan penjualan berdasarkan filter yang dipilih." totalSalesAmount={totalSalesAmount} totalAdminFee={totalAdminFee} initialBalance={initialBalance} onSetInitialBalance={setInitialBalance} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold">Laporan Penjualan</h2>
            <div className="w-full md:w-auto md:max-w-sm">
              <Input placeholder="Cari produk, nama, atau tujuan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <ReportFilters onFilterChange={(mode, value) => setFilter({ mode, value })} onClearFilters={() => { setFilter({ mode: "all" }); setCategoryFilter(""); }} onCategoryChange={setCategoryFilter} categories={uniqueCategories} />
        </div>
        <div className="w-full">
          <SalesHistoryTable sales={filteredSales || []} onPrintReceipt={handlePrintReceipt} onDeleteSale={handleDeleteSale} onExportCSV={handleExportCSV} />
        </div>
        <div className="grid gap-8 md:grid-cols-2 print:hidden">
          <SalesChart sales={sales || []} />
          <CategoryChart sales={sales || []} />
        </div>
      </main>
      <footer className="mt-12 print:hidden"><MadeWithDyad /></footer>
    </div>
  );
};

export default Index;