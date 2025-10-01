"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export interface Sale {
  id: string | number;
  customer_name?: string;
  phone: string;
  amount: number;
  admin_fee?: number;
  createdAt: Date;
}

interface SalesHistoryTableProps {
  sales: Sale[];
  onPrintReceipt: (sale: Sale) => void;
}

export const SalesHistoryTable = ({ sales, onPrintReceipt }: SalesHistoryTableProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Riwayat Penjualan</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="print:hidden"
        >
          <Printer className="mr-2 h-4 w-4" />
          Cetak Laporan
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu Transaksi</TableHead>
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>Nomor HP</TableHead>
                <TableHead className="text-right">Nominal (Rp)</TableHead>
                <TableHead className="text-right">Admin (Rp)</TableHead>
                <TableHead className="text-right">Total (Rp)</TableHead>
                <TableHead className="text-right print:hidden">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => {
                  const adminFee = sale.admin_fee || 0;
                  const total = sale.amount + adminFee;
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {sale.createdAt.toLocaleString("id-ID", {
                          hour12: false,
                        })}
                      </TableCell>
                      <TableCell>{sale.customer_name || "-"}</TableCell>
                      <TableCell>{sale.phone}</TableCell>
                      <TableCell className="text-right">
                        {sale.amount.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        {adminFee.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {total.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right print:hidden">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onPrintReceipt(sale)}
                          title="Cetak Struk"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    Belum ada data penjualan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};