"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { Sale } from "@/components/SalesHistoryTable";

const CustomerDetail = () => {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: sales, isLoading } = useQuery<Sale[]>({
    queryKey: ["customer_sales", phone, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id || !phone) return [];
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("phone", phone)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map((sale) => ({
        ...sale,
        createdAt: new Date(sale.created_at),
      }));
    },
    enabled: !!session?.user?.id && !!phone,
  });

  const customerSummary = useMemo(() => {
    if (!sales || sales.length === 0) return null;

    const customerName =
      sales.find((s) => s.customer_name)?.customer_name || "Tanpa Nama";
    const transactionCount = sales.length;
    const totalSpent = sales.reduce(
      (sum, sale) => sum + sale.amount + (sale.admin_fee || 0),
      0
    );

    return {
      name: customerName,
      phone,
      transactionCount,
      totalSpent,
    };
  }, [sales, phone]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-5 w-1/4 mt-2" />
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customerSummary) {
    return (
      <div className="container mx-auto p-4 md:p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Pelanggan Tidak Ditemukan</h1>
        <p>Tidak ada data untuk pelanggan dengan nomor HP: {phone}</p>
        <Button onClick={() => navigate("/customers")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Pelanggan
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Button variant="outline" onClick={() => navigate("/customers")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Pelanggan
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{customerSummary.name}</CardTitle>
          <CardDescription>{customerSummary.phone}</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">
              Jumlah Transaksi
            </div>
            <div className="text-2xl font-bold">
              {customerSummary.transactionCount}
            </div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">Total Belanja</div>
            <div className="text-2xl font-bold">
              Rp {customerSummary.totalSpent.toLocaleString("id-ID")}
            </div>
          </div>
        </CardContent>
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
                  <TableHead>Waktu Transaksi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Total (Rp)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales?.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {sale.createdAt.toLocaleString("id-ID", {
                        hour12: false,
                      })}
                    </TableCell>
                    <TableCell>{sale.category || "-"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {(sale.amount + (sale.admin_fee || 0)).toLocaleString(
                        "id-ID"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetail;