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

export interface Sale {
  id: string | number;
  customer_name?: string;
  phone: string;
  amount: number;
  createdAt: Date;
}

interface SalesHistoryTableProps {
  sales: Sale[];
}

export const SalesHistoryTable = ({ sales }: SalesHistoryTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Penjualan</CardTitle>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length > 0 ? (
                sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {sale.createdAt.toLocaleString("id-ID", { hour12: false })}
                    </TableCell>
                    <TableCell>{sale.customer_name || "-"}</TableCell>
                    <TableCell>{sale.phone}</TableCell>
                    <TableCell className="text-right">
                      {sale.amount.toLocaleString("id-ID")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
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