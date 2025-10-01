"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";

interface SalesEntryFormProps {
  onAddSale: (sale: { phone: string; amount: number }) => void;
}

export const SalesEntryForm = ({ onAddSale }: SalesEntryFormProps) => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !amount) {
      showError("Nomor HP dan Nominal harus diisi.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showError("Nominal harus berupa angka positif.");
      return;
    }

    onAddSale({ phone, amount: numericAmount });
    showSuccess("Penjualan berhasil dicatat!");

    // Reset form
    setPhone("");
    setAmount("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Catat Penjualan Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor HP Pelanggan</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Contoh: 081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Nominal Penjualan (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Contoh: 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Simpan Transaksi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};