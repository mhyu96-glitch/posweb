"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Sale } from "@/components/SalesHistoryTable";

const CustomerDetail = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("name, phone")
        .eq("id", customerId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: sales, isLoading: isLoadingSales } = useQuery<Sale[]>({
    queryKey: ["customerSales", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from("sales")
        .select("*, products(name)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map(sale => ({ ...sale, createdAt: new Date(sale.created_at) }));
    },
    enabled: !!customerId,
  });

  if (isLoadingCustomer || isLoadingSales) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-12 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-center">
        <h2 className="text-2xl font-bold">Pelanggan tidak ditemukan</h2>
        <Button onClick={() => navigate("/customers")} className="mt-4">Kembali ke Daftar Pelanggan</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Button variant="outline" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{customer.name}</CardTitle>
          <CardDescription>
            {customer.phone || "Nomor telepon tidak tersedia"}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Produk/Layanan</TableHead>
                  <TableHead className="text-right">Total (Rp)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales && sales.length > 0 ? (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.createdAt.toLocaleDateString("id-ID")}</TableCell>
                      <TableCell>{sale.products?.name || sale.category || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {(sale.amount + (sale.admin_fee || 0)).toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Belum ada transaksi untuk pelanggan ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetail;