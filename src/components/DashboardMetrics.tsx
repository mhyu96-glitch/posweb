"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sale } from "./SalesHistoryTable";
import {
  startOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";

interface DashboardMetricsProps {
  sales: Sale[];
}

const calculateMetrics = (sales: Sale[]) => {
  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const totalTransactions = sales.length;
  const averageTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  return { totalSales, totalTransactions, averageTransaction };
};

export const DashboardMetrics = ({ sales }: DashboardMetricsProps) => {
  const today = startOfToday();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const dailySales = sales.filter((sale) =>
    isWithinInterval(sale.createdAt, { start: today, end: new Date() })
  );
  const weeklySales = sales.filter((sale) =>
    isWithinInterval(sale.createdAt, { start: weekStart, end: weekEnd })
  );
  const monthlySales = sales.filter((sale) =>
    isWithinInterval(sale.createdAt, { start: monthStart, end: monthEnd })
  );

  const dailyMetrics = calculateMetrics(dailySales);
  const weeklyMetrics = calculateMetrics(weeklySales);
  const monthlyMetrics = calculateMetrics(monthlySales);

  const MetricCard = ({ title, value, description }: { title: string; value: string; description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const MetricsTab = ({ metrics }: { metrics: ReturnType<typeof calculateMetrics> }) => (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        title="Total Penjualan"
        value={`Rp ${metrics.totalSales.toLocaleString("id-ID")}`}
        description="Total nominal dari semua transaksi"
      />
      <MetricCard
        title="Jumlah Transaksi"
        value={metrics.totalTransactions.toString()}
        description="Total jumlah transaksi yang tercatat"
      />
      <MetricCard
        title="Rata-rata Transaksi"
        value={`Rp ${Math.round(metrics.averageTransaction).toLocaleString("id-ID")}`}
        description="Rata-rata nominal per transaksi"
      />
    </div>
  );

  return (
    <Tabs defaultValue="today" className="space-y-4">
      <TabsList>
        <TabsTrigger value="today">Hari Ini</TabsTrigger>
        <TabsTrigger value="week">Minggu Ini</TabsTrigger>
        <TabsTrigger value="month">Bulan Ini</TabsTrigger>
      </TabsList>
      <TabsContent value="today">
        <MetricsTab metrics={dailyMetrics} />
      </TabsContent>
      <TabsContent value="week">
        <MetricsTab metrics={weeklyMetrics} />
      </TabsContent>
      <TabsContent value="month">
        <MetricsTab metrics={monthlyMetrics} />
      </TabsContent>
    </Tabs>
  );
};