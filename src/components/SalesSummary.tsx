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
  const [balanceInput, setBalanceInput] = useState(initialBalance.toString());

  useEffect(() => {
    setBalanceInput(initialBalance.toString());
  }, [initialBalance]);

  const totalRevenue = totalSalesAmount + totalAdminFee;
  const finalBalance = initialBalance - totalRevenue;

  const handleSetBalance = () => {
    const numericBalance = parseFloat(balanceInput);
    if (!isNaN(numericBalance) && numericBalance >= 0) {
      onSetInitialBalance(numericBalance);
    }
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
            <span>Total Penjualan:</span>
            <span className="font-medium">
              Rp {totalSalesAmount.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Biaya Admin:</span>
            <span className="font-medium">
              Rp {totalAdminFee.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-green-600">
            <span>Keuntungan Penjualan:</span>
            <span>
              Rp {totalAdminFee.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span>Total Pemasukan Periode Ini:</span>
            <span className="font-medium text-red-600">
              - Rp {totalRevenue.toLocaleString("id-ID")}
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