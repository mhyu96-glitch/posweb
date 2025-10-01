"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

const ITEMS_PER_PAGE = 20;

export const SalesHistoryTable = ({
  sales,
  onPrintReceipt,
}: SalesHistoryTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const pageCount = Math.ceil(sales.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSales = sales.slice(startIndex, endIndex);

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
                <TableHead className="text-center">Nominal (Rp)</TableHead>
                <TableHead className="text-center">Admin (Rp)</TableHead>
                <TableHead className="text-center">Total (Rp)</TableHead>
                <TableHead className="text-right print:hidden">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSales.length > 0 ? (
                currentSales.map((sale) => {
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
                      <TableCell className="text-center">
                        {sale.amount.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-center">
                        {adminFee.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-center font-medium">
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
      {pageCount > 1 && (
        <CardFooter className="flex items-center justify-between print:hidden">
          <div className="text-sm text-muted-foreground">
            Halaman {currentPage} dari {pageCount}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.min(prev + 1, pageCount));
                  }}
                  className={
                    currentPage === pageCount
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
};