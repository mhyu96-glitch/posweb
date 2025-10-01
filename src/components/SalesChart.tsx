"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "./SalesHistoryTable";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";

interface SalesChartProps {
  sales: Sale[];
}

export const SalesChart = ({ sales }: SalesChartProps) => {
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const data = last7Days.map((day) => {
    const dailySales = sales.filter((sale) => isSameDay(sale.createdAt, day));
    const total = dailySales.reduce((sum, sale) => sum + sale.amount + (sale.admin_fee || 0), 0);
    return {
      name: format(day, "dd/MM"),
      Penjualan: total,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grafik Penjualan 7 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  notation: "compact",
                }).format(value as number)
              }
            />
            <Tooltip
              formatter={(value) =>
                new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(value as number)
              }
            />
            <Legend />
            <Bar dataKey="Penjualan" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};