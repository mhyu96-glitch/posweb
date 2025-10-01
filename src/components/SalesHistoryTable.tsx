"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Printer, Trash2, FileDown } from "lucide-react";

export interface Sale {
  id: string | number;
  created_at: string;
  createdAt: Date;
  customer_name?: string;
  phone?: string;
  bank_name?: string;
  amount: number;
  admin_fee?: number;
  category?: string;
}

interface SalesHistoryTableProps {
  sales: Sale[];
  onPrintReceipt: (sale: Sale) => void;
  onDeleteSale: (saleId: string | number) => void;
  onExportCSV: () => void;
}

export const SalesHistoryTable = ({
  sales,
  onPrintReceipt,
  onDeleteSale,
  onExportCSV,
}: SalesHistoryTableProps) => {
  return (
    <div className="rounded-md border">
      <div className="p-4">
        <Button onClick={onExportCSV}>
          <FileDown className="mr-2 h-4 w-4" />
          Ekspor ke CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Detail Tujuan</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length > 0 ? (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.createdAt.toLocaleString("id-ID", { hour12: false })}</TableCell>
                <TableCell>{sale.customer_name || "-"}</TableCell>
                <TableCell>
                  {sale.bank_name ? `${sale.bank_name} - ${sale.phone}` : sale.phone || "-"}
                </TableCell>
                <TableCell>{sale.category || "-"}</TableCell>
                <TableCell className="text-right">
                  Rp {(sale.amount + (sale.admin_fee || 0)).toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onPrintReceipt(sale)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak Struk
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDeleteSale(sale.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Tidak ada data penjualan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};