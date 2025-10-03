"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Interface for the data fetched from Supabase
interface AdminFeeSale {
  category: string | null;
  admin_fee: number;
}

// Interface for the processed report data
interface CategoryReport {
  category: string;
  transactionCount: number;
  totalProfit: number;
}

const Reports = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });

  // Fetch all sales, selecting only category and admin_fee
  const { data: sales, isLoading: isLoadingSales } = useQuery<AdminFeeSale[]>({
    queryKey: ["allSalesForAdminReport", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from("sales")
        .select("category, admin_fee")
        .eq("user_id", session.user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Process the fetched data to create the report
  const categoryReportData = useMemo(() => {
    if (!sales) return [];

    const report = sales.reduce((acc, sale) => {
      const category = sale.category || "Lainnya";
      const profit = sale.admin_fee || 0;

      // We only care about transactions that generated a profit
      if (profit > 0) {
        if (!acc[category]) {
          acc[category] = {
            category: category,
            transactionCount: 0,
            totalProfit: 0,
          };
        }
        acc[category].transactionCount += 1;
        acc[category].totalProfit += profit;
      }
      return acc;
    }, {} as Record<string, CategoryReport>);

    return Object.values(report);
  }, [sales]);

  // Create sorted lists for the tabs
  const sortedByTransactions = useMemo(() => [...categoryReportData].sort((a, b) => b.transactionCount - a.transactionCount), [categoryReportData]);
  const sortedByProfit = useMemo(() => [...categoryReportData].sort((a, b) => b.totalProfit - a.totalProfit), [categoryReportData]);

  if (isLoadingSales) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent><Skeleton className="h-48 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <main className="space-y-6">
        <h1 className="text-3xl font-bold">Laporan Analitik</h1>
        <Card>
          <CardHeader>
            <CardTitle>Laporan Keuntungan Admin</CardTitle>
            <CardDescription>Analisis keuntungan dari biaya admin berdasarkan kategori transaksi.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profit">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profit">Berdasarkan Keuntungan</TabsTrigger>
                <TabsTrigger value="transactions">Berdasarkan Jumlah Transaksi</TabsTrigger>
              </TabsList>
              <TabsContent value="profit" className="mt-4">
                <CategoryReportTable data={sortedByProfit} />
              </TabsContent>
              <TabsContent value="transactions" className="mt-4">
                <CategoryReportTable data={sortedByTransactions} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const CategoryReportTable = ({ data }: { data: CategoryReport[] }) => (
  <div className="border rounded-md">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kategori Transaksi</TableHead>
          <TableHead className="text-right">Jumlah Transaksi</TableHead>
          <TableHead className="text-right">Total Keuntungan Admin (Rp)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((item) => (
            <TableRow key={item.category}>
              <TableCell className="font-medium">{item.category}</TableCell>
              <TableCell className="text-right">{item.transactionCount.toLocaleString("id-ID")}</TableCell>
              <TableCell className="text-right">{item.totalProfit.toLocaleString("id-ID")}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="h-24 text-center">
              Tidak ada data transaksi dengan biaya admin untuk ditampilkan.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

export default Reports;