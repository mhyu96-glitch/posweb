"use client";

import { useState } from "react";
import { SalesEntryForm } from "@/components/SalesEntryForm";
import { DailySummary } from "@/components/DailySummary";
import { SalesHistoryTable, Sale } from "@/components/SalesHistoryTable";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [initialBalance, setInitialBalance] = useState(0);

  const handleAddSale = (newSale: { phone: string; amount: number }) => {
    const saleWithMeta: Sale = {
      ...newSale,
      id: Date.now(), // Unique ID sederhana
      createdAt: new Date(),
    };
    // Menambahkan penjualan baru ke atas daftar
    setSales([saleWithMeta, ...sales]);
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.amount, 0);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Catatan Penjualan Harian
        </h1>
        <p className="text-muted-foreground mt-2">
          Aplikasi sederhana untuk mencatat penjualan Anda.
        </p>
      </header>

      <main className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <SalesEntryForm onAddSale={handleAddSale} />
          </div>
          <div className="lg:col-span-2">
            <DailySummary 
              totalSales={totalSales}
              initialBalance={initialBalance}
              onSetInitialBalance={setInitialBalance}
            />
          </div>
        </div>

        <div className="w-full">
          <SalesHistoryTable sales={sales} />
        </div>
      </main>
      
      <footer className="mt-12">
        <MadeWithDyad />
      </footer>
    </div>
  );
};

export default Index;