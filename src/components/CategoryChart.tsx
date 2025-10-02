"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { Sale } from "./SalesHistoryTable";

interface CategoryChartProps {
  sales: Sale[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export const CategoryChart = ({ sales }: CategoryChartProps) => {
  const chartData = useMemo(() => {
    if (!sales || sales.length === 0) return [];

    const categoryTotals = sales.reduce((acc, sale) => {
      const category = sale.category || "Lainnya";
      const total = sale.amount + (sale.admin_fee || 0);
      acc[category] = (acc[category] || 0) + total;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [sales]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Penjualan per Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `Rp${new Intl.NumberFormat("id-ID").format(value)}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Tidak ada data untuk ditampilkan.
          </div>
        )}
      </CardContent>
    </Card>
  );
};