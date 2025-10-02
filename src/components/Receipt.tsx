"use client";

import { Sale } from "./SalesHistoryTable";

interface Settings {
  shop_name?: string;
  shop_address?: string;
  shop_phone?: string;
}

interface ReceiptProps {
  sale: Sale;
  settings?: Settings | null;
}

export const Receipt = ({ sale, settings }: ReceiptProps) => {
  const adminFee = sale.admin_fee || 0;
  const total = sale.amount + adminFee;
  const destinationDetail = sale.bank_name
    ? `${sale.bank_name.toUpperCase()} - ${sale.phone}`
    : sale.phone;

  return (
    <div className="receipt-component w-full max-w-[300px] mx-auto bg-white p-4 font-mono text-sm text-black rounded-lg shadow-lg">
      <div className="text-center">
        <h2 className="text-lg font-bold">{settings?.shop_name || "STRUK PEMBAYARAN"}</h2>
        {settings?.shop_address && <p className="text-xs">{settings.shop_address}</p>}
        {settings?.shop_phone && <p className="text-xs">Telp: {settings.shop_phone}</p>}
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
        <p>Tujuan: {destinationDetail || "-"}</p>
        <p>Metode: {sale.category || "Tunai"}</p>
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