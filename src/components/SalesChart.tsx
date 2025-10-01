"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { format, subDays, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Sale } from "./SalesHistoryTable";

interface SalesChartProps {
  sales: Sale[];
}

export const SalesChart = ({ sales }: SalesChartProps) => {
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse();
    
    const data = last7Days.map(day => {
      const formattedDate = format(day, "EEE, d MMM", { locale: id });
      const dailySales = sales.filter(sale => isSameDay(sale.createdAt, day));
      const totalAmount = dailySales.reduce((sum, sale) => sum + sale.amount, 0);
      const totalAdminFee = dailySales.reduce((sum, sale) => sum + (sale.admin_fee || 0), 0);
      
      return {
        name: formattedDate,
        "Penjualan": totalAmount,
        "Biaya Admin": totalAdminFee,
      };
    });

    return data;
  }, [sales]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Penjualan (7 Hari Terakhir)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `Rp${new Intl.NumberFormat("id-ID").format(value)}`}
            />
            <Tooltip
              formatter={(value: number) => `Rp${new Intl.NumberFormat("id-ID").format(value)}`}
              cursor={{ fill: "hsl(var(--muted))" }}
            />
            <Legend />
            <Bar dataKey="Penjualan" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Biaya Admin" fill="hsl(var(--secondary-foreground))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};