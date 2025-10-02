"use client";

import { useMemo } from "react";
import { isToday } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { Sale } from "./SalesHistoryTable";

interface DashboardMetricsProps {
  sales: Sale[];
}

export const DashboardMetrics = ({ sales }: DashboardMetricsProps) => {
  const metrics = useMemo(() => {
    const todaySales = sales.filter(sale => isToday(sale.createdAt));

    const totalTodayRevenue = todaySales.reduce((sum, sale) => sum + sale.amount + (sale.admin_fee || 0), 0);
    const totalTodayTransactions = todaySales.length;
    const totalTodayProfit = todaySales.reduce((sum, sale) => {
      const profitFromProduct = sale.amount - (sale.cost_price || 0);
      return sum + profitFromProduct + (sale.admin_fee || 0);
    }, 0);

    return {
      totalTodayRevenue,
      totalTodayTransactions,
      totalTodayProfit,
    };
  }, [sales]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {metrics.totalTodayRevenue.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-muted-foreground">
            Total penjualan + biaya admin
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Laba Hari Ini</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            Rp {metrics.totalTodayProfit.toLocaleString("id-ID")}
          </div>
          <p className="text-xs text-muted-foreground">
            Laba bersih setelah dikurangi modal
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalTodayTransactions}
          </div>
          <p className="text-xs text-muted-foreground">
            Jumlah transaksi yang tercatat
          </p>
        </CardContent>
      </Card>
    </div>
  );
};