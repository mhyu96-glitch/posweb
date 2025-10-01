"use client";

import { Sale } from "./SalesHistoryTable";

interface ReceiptProps {
  sale: Sale;
}

export const Receipt = ({ sale }: ReceiptProps) => {
  const adminFee = sale.admin_fee || 0;
  const total = sale.amount + adminFee;

  return (
    <div className="receipt-component w-full max-w-[300px] mx-auto bg-white p-4 font-mono text-sm text-black rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-lg font-bold">STRUK PEMBAYARAN</h2>
        <p className="text-xs">Catatan Penjualan Harian</p>
      </div>
      <div className="border-t border-b border-dashed border-black my-3 py-2">
        <div className="flex justify-between">
          <span>Tanggal:</span>
          <span>{sale.createdAt.toLocaleDateString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>{sale.createdAt.toLocaleTimeString("id-ID", { hour12: false })}</span>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <p>Pelanggan: {sale.customer_name || "-"}</p>
        <p>No. HP: {sale.phone}</p>
      </div>
      <div className="border-t border-dashed border-black my-3 pt-2">
        <div className="flex justify-between">
          <span>Nominal</span>
          <span>Rp {sale.amount.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Biaya Admin</span>
          <span>Rp {adminFee.toLocaleString("id-ID")}</span>
        </div>
      </div>
      <div className="border-t-2 border-black my-2 pt-2 font-bold">
        <div className="flex justify-between">
          <span>TOTAL</span>
          <span>Rp {total.toLocaleString("id-ID")}</span>
        </div>
      </div>
      <div className="text-center mt-4 text-xs">
        <p>Terima kasih!</p>
      </div>
    </div>
  );
};