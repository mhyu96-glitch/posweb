"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "./CurrencyInput";

interface SalesSummaryProps {
  title: string;
  description: string;
  totalSalesAmount: number;
  totalAdminFee: number;
  initialBalance: number;
  onSetInitialBalance: (balance: number) => void;
}

export const SalesSummary = ({
  title,
  description,
  totalSalesAmount,
  totalAdminFee,
  initialBalance,
  onSetInitialBalance,
}: SalesSummaryProps) => {
  const totalRevenue = totalSalesAmount + totalAdminFee;
  const finalBalance = initialBalance + totalRevenue;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="initial-balance">Saldo Awal</Label>
          <CurrencyInput
            id="initial-balance"
            value={initialBalance}
            onValueChange={(value) => onSetInitialBalance(value || 0)}
            placeholder="Masukkan saldo awal kas"
          />
        </div>
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Penjualan</span>
            <span>Rp {totalSalesAmount.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Biaya Admin</span>
            <span>Rp {totalAdminFee.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total Pemasukan</span>
            <span>Rp {totalRevenue.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
            <span>Saldo Akhir</span>
            <span>Rp {finalBalance.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};