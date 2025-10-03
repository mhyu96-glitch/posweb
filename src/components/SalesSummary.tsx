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

interface SalesSummaryProps {
  title: string;
  description: string;
  totalSalesAmount: number;
  totalAdminFee: number;
  totalProfit: number;
  initialBalance: number;
  onSetInitialBalance: (balance: number) => void;
}

export const SalesSummary = ({
  title,
  description,
  totalSalesAmount,
  totalAdminFee,
  totalProfit,
  initialBalance,
  onSetInitialBalance,
}: SalesSummaryProps) => {
  const [balanceInput, setBalanceInput] = useState(
    new Intl.NumberFormat("id-ID").format(initialBalance)
  );

  useEffect(() => {
    setBalanceInput(new Intl.NumberFormat("id-ID").format(initialBalance));
  }, [initialBalance]);

  const totalRevenue = totalSalesAmount + totalAdminFee;
  const finalBalance = initialBalance - totalRevenue;

  const handleBalanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    if (rawValue === "") {
      setBalanceInput("");
      return;
    }
    const formattedValue = new Intl.NumberFormat("id-ID").format(Number(rawValue));
    setBalanceInput(formattedValue);
  };

  const handleSetBalance = () => {
    const numericBalance = parseFloat(balanceInput.replace(/\./g, ""));
    onSetInitialBalance(isNaN(numericBalance) ? 0 : numericBalance);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="initial-balance" className="flex-shrink-0">Saldo Awal (Rp)</Label>
          <Input
            id="initial-balance"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={balanceInput}
            onChange={handleBalanceInputChange}
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
          <div className="flex justify-between font-bold text-green-600">
            <span>Total Laba Bersih (dari Biaya Admin):</span>
            <span>
              + Rp {totalProfit.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span>Total Pengeluaran (Transaksi):</span>
            <span className="font-medium text-red-600">
              - Rp {totalRevenue.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full text-lg font-bold">
          <span>Saldo Akhir:</span>
          <span className="text-blue-700">Rp {finalBalance.toLocaleString("id-ID")}</span>
        </div>
      </CardFooter>
    </Card>
  );
};