"use client";

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, LogOut } from "lucide-react";

interface ShiftDetails {
  start_time: string;
  end_time: string;
  starting_balance: number;
  profiles: { first_name: string; last_name: string | null } | null;
}

interface Sale {
  category: string | null;
  amount: number;
  admin_fee: number | null;
}

const ShiftReport = () => {
  const { shiftId } = useParams();
  const navigate = useNavigate();

  const { data: shiftDetails, isLoading: isLoadingShift } = useQuery<ShiftDetails | null>({
    queryKey: ["shift", shiftId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shifts")
        .select("start_time, end_time, starting_balance, profiles(first_name, last_name)")
        .eq("id", shiftId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!shiftId,
  });

  const { data: sales, isLoading: isLoadingSales } = useQuery<Sale[]>({
    queryKey: ["shiftSales", shiftId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("category, amount, admin_fee")
        .eq("shift_id", shiftId);
      if (error) throw error;
      return data;
    },
    enabled: !!shiftId,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  useEffect(() => {
    // Prevent access to main app by removing session
    supabase.auth.signOut();
  }, []);

  if (isLoadingShift || isLoadingSales) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md"><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!shiftDetails || !sales) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader><CardTitle>Laporan Tidak Ditemukan</CardTitle></CardHeader>
          <CardContent><p>Tidak dapat memuat detail untuk shift ini.</p></CardContent>
          <CardFooter><Button onClick={() => navigate('/login')} className="w-full">Kembali ke Login</Button></CardFooter>
        </Card>
      </div>
    );
  }

  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
  const totalAdminFee = sales.reduce((sum, s) => sum + (s.admin_fee || 0), 0);
  const totalRevenue = totalSales + totalAdminFee;
  const expectedBalance = (shiftDetails.starting_balance || 0) + totalRevenue;

  const categorySummary = sales.reduce((acc, sale) => {
    const category = sale.category || "Lainnya";
    if (!acc[category]) {
      acc[category] = { count: 0, total: 0 };
    }
    acc[category].count += 1;
    acc[category].total += sale.amount + (sale.admin_fee || 0);
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 print:bg-white print:items-start">
      <Card className="w-full max-w-md print:shadow-none print:border-none">
        <CardHeader className="text-center">
          <CardTitle>Laporan Akhir Shift</CardTitle>
          <CardDescription>
            Kasir: {shiftDetails.profiles?.first_name || "N/A"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-1">
            <div className="flex justify-between"><span>Mulai Shift:</span> <span>{new Date(shiftDetails.start_time).toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between"><span>Selesai Shift:</span> <span>{new Date(shiftDetails.end_time).toLocaleString("id-ID")}</span></div>
          </div>
          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold">Ringkasan Keuangan</h3>
            <div className="flex justify-between text-sm"><span>Saldo Awal:</span> <span>Rp {shiftDetails.starting_balance.toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between text-sm"><span>Total Penjualan:</span> <span>Rp {totalSales.toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between text-sm"><span>Total Biaya Admin:</span> <span>Rp {totalAdminFee.toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between font-bold pt-2 border-t"><span>Total Pemasukan:</span> <span>Rp {totalRevenue.toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between font-bold text-lg"><span>Saldo Akhir Seharusnya:</span> <span>Rp {expectedBalance.toLocaleString("id-ID")}</span></div>
          </div>
          <div className="border-t pt-4 space-y-2">
            <h3 className="font-semibold">Rincian per Kategori</h3>
            {Object.entries(categorySummary).map(([category, data]) => (
              <div key={category} className="flex justify-between text-sm">
                <span>{category} ({data.count}x):</span>
                <span>Rp {data.total.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 print:hidden">
          <Button onClick={() => window.print()} className="w-full"><Printer className="mr-2 h-4 w-4" /> Cetak Laporan</Button>
          <Button onClick={handleLogout} variant="destructive" className="w-full"><LogOut className="mr-2 h-4 w-4" /> Logout & Kembali</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShiftReport;