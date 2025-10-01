"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SalesEntryForm } from "./SalesEntryForm";
import { SalesSummary } from "./SalesSummary";
import { Sale } from "./SalesHistoryTable";
import { PlusCircle } from "lucide-react";

interface SalesEntrySheetProps {
  onAddSale: (sale: any) => void;
  previousCustomers: { name: string }[];
  filteredSales: Sale[] | undefined;
  initialBalance: number;
  onSetInitialBalance: (balance: number) => void;
}

export const SalesEntrySheet = ({
  onAddSale,
  previousCustomers,
  filteredSales,
  initialBalance,
  onSetInitialBalance,
}: SalesEntrySheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Transaksi Baru</SheetTitle>
          <SheetDescription>
            Catat transaksi penjualan baru di sini. Klik simpan jika sudah selesai.
          </SheetDescription>
        </SheetHeader>
        <div className="py-8 space-y-8">
          <SalesEntryForm onAddSale={onAddSale} previousCustomers={previousCustomers} />
          <SalesSummary
            title="Ringkasan Penjualan"
            description="Ringkasan penjualan berdasarkan filter yang dipilih."
            totalSalesAmount={filteredSales?.reduce((sum, sale) => sum + sale.amount, 0) || 0}
            totalAdminFee={filteredSales?.reduce((sum, sale) => sum + (sale.admin_fee || 0), 0) || 0}
            initialBalance={initialBalance}
            onSetInitialBalance={onSetInitialBalance}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};