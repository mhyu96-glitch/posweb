"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface Sale {
  product_id: string | null;
  amount: number;
  admin_fee: number;
  products: { name: string } | null;
}

interface ProductReport {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

const Reports = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });

  const { data: sales, isLoading: isLoadingSales } = useQuery<Sale[]>({
    queryKey: ["allSalesForReports", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from("sales")
        .select("product_id, amount, admin_fee, products(name)")
        .eq("user_id", session.user.id)
        .not("product_id", "is", null); // Hanya ambil penjualan yang terkait dengan produk
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const productReportData = useMemo(() => {
    if (!sales) return [];

    const report = sales.reduce((acc, sale) => {
      if (!sale.product_id || !sale.products?.name) return acc;

      if (!acc[sale.product_id]) {
        acc[sale.product_id] = {
          productId: sale.product_id,
          name: sale.products.name,
          quantity: 0,
          revenue: 0,
        };
      }
      acc[sale.product_id].quantity += 1;
      acc[sale.product_id].revenue += sale.amount + (sale.admin_fee || 0);
      return acc;
    }, {} as Record<string, ProductReport>);

    return Object.values(report);
  }, [sales]);

  const sortedByQuantity = useMemo(() => [...productReportData].sort((a, b) => b.quantity - a.quantity), [productReportData]);
  const sortedByRevenue = useMemo(() => [...productReportData].sort((a, b) => b.revenue - a.revenue), [productReportData]);

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
            <CardTitle>Laporan Produk Terlaris</CardTitle>
            <CardDescription>Analisis produk berdasarkan jumlah penjualan dan total pendapatan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="quantity">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quantity">Berdasarkan Jumlah Terjual</TabsTrigger>
                <TabsTrigger value="revenue">Berdasarkan Pendapatan</TabsTrigger>
              </TabsList>
              <TabsContent value="quantity" className="mt-4">
                <ProductReportTable data={sortedByQuantity} />
              </TabsContent>
              <TabsContent value="revenue" className="mt-4">
                <ProductReportTable data={sortedByRevenue} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const ProductReportTable = ({ data }: { data: ProductReport[] }) => (
  <div className="border rounded-md">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Produk</TableHead>
          <TableHead className="text-right">Jumlah Terjual</TableHead>
          <TableHead className="text-right">Total Pendapatan (Rp)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((item) => (
            <TableRow key={item.productId}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">{item.revenue.toLocaleString("id-ID")}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="h-24 text-center">
              Tidak ada data penjualan produk untuk ditampilkan.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
);

export default Reports;