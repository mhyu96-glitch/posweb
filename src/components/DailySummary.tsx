"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DailySummaryProps {
  totalSales: number;
  initialBalance: number;
  onSetInitialBalance: (balance: number) => void;
}

export const DailySummary = ({
  totalSales,
  initialBalance,
  onSetInitialBalance,
}: DailySummaryProps) => {
  const [balanceInput, setBalanceInput] = useState(initialBalance.toString());

  useEffect(() => {
    setBalanceInput(initialBalance.toString());
  }, [initialBalance]);

  const finalBalance = initialBalance - totalSales;

  const handleSetBalance = () => {
    const numericBalance = parseFloat(balanceInput);
    if (!isNaN(numericBalance) && numericBalance >= 0) {
      onSetInitialBalance(numericBalance);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ringkasan Harian</CardTitle>
        <CardDescription>
          Atur saldo awal dan lihat ringkasan penjualan harian Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="initial-balance" className="flex-shrink-0">Saldo Awal (Rp)</Label>
          <Input
            id="initial-balance"
            type="number"
            placeholder="0"
            value={balanceInput}
            onChange={(e) => setBalanceInput(e.target.value)}
          />
          <Button onClick={handleSetBalance}>Atur</Button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Saldo Awal:</span>
            <span className="font-medium">
              Rp {initialBalance.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Penjualan Hari Ini:</span>
            <span className="font-medium text-red-600">
              - Rp {totalSales.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full text-lg font-bold">
          <span>Saldo Akhir:</span>
          <span>Rp {finalBalance.toLocaleString("id-ID")}</span>
        </div>
      </CardFooter>
    </Card>
  );
};