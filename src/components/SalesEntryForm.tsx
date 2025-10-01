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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

interface Customer {
  name: string;
}

interface SalesEntryFormProps {
  onAddSale: (sale: {
    name: string;
    destination: string;
    bankName?: string;
    amount: number;
    adminFee: number;
    category: string;
  }) => void;
  previousCustomers: Customer[];
}

const categories = [
  "Transfer Antar Bank", "Transfer Beda Bank", "DANA", "Gopay", "OVO", "Tunai", "Lainnya",
];
const eWalletCategories = ["DANA", "Gopay", "OVO"];
const bankCategories = ["Transfer Antar Bank", "Transfer Beda Bank"];

export const SalesEntryForm = ({ onAddSale, previousCustomers }: SalesEntryFormProps) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [adminFee, setAdminFee] = useState("");
  const [category, setCategory] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  // State for destination details
  const [destination, setDestination] = useState("");
  const [bankName, setBankName] = useState("");

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"phone" | "bank" | null>(null);
  const [modalInputValue, setModalInputValue] = useState("");
  const [modalBankName, setModalBankName] = useState("");

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(e.target.value.replace(/[^\d]/g, ""));
  };

  const formatCurrency = (value: string) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(Number(value));
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setDestination("");
    setBankName("");

    if (eWalletCategories.includes(value)) {
      setModalType("phone");
      setModalInputValue("");
      setIsModalOpen(true);
    } else if (bankCategories.includes(value)) {
      setModalType("bank");
      setModalInputValue("");
      setModalBankName("");
      setIsModalOpen(true);
    }
  };

  const handleModalSave = () => {
    if (modalType === "phone") {
      setDestination(modalInputValue);
    } else if (modalType === "bank") {
      setDestination(modalInputValue);
      setBankName(modalBankName);
    }
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) {
      showError("Nominal dan Kategori harus diisi.");
      return;
    }
    if ((eWalletCategories.includes(category) || bankCategories.includes(category)) && !destination) {
      showError("Detail tujuan harus diisi untuk kategori ini.");
      return;
    }

    onAddSale({
      name,
      destination,
      bankName,
      amount: parseFloat(amount),
      adminFee: parseFloat(adminFee) || 0,
      category,
    });
    showSuccess("Penjualan berhasil dicatat!");

    // Reset form
    setName(""); setAmount(""); setAdminFee(""); setCategory(""); setDestination(""); setBankName("");
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader><CardTitle>Catat Penjualan Baru</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Pelanggan (Opsional)</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {name || "Pilih atau ketik nama..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Cari atau masukkan nama baru..." value={name} onValueChange={setName} />
                    <CommandEmpty>Nama tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {previousCustomers.map((c) => <CommandItem key={c.name} value={c.name} onSelect={(val) => { setName(val); setComboboxOpen(false); }}>{c.name}</CommandItem>)}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori Penjualan</Label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori pembayaran" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {destination && (
              <div className="space-y-1 rounded-md bg-muted p-3">
                <Label className="text-xs font-medium text-muted-foreground">Detail Tujuan</Label>
                <p className="text-sm font-semibold">{bankName ? `${bankName.toUpperCase()} - ${destination}` : destination}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="amount">Nominal Penjualan (Rp)</Label>
              <Input id="amount" type="text" inputMode="numeric" placeholder="Contoh: 50000" value={formatCurrency(amount)} onChange={(e) => handleNumericInputChange(e, setAmount)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-fee">Biaya Admin (Rp)</Label>
              <Input id="admin-fee" type="text" inputMode="numeric" placeholder="Contoh: 2500" value={formatCurrency(adminFee)} onChange={(e) => handleNumericInputChange(e, setAdminFee)} />
            </div>
            <Button type="submit" className="w-full">Simpan Transaksi</Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'phone' ? 'Masukkan Nomor Tujuan' : 'Masukkan Detail Rekening'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {modalType === 'bank' && (
              <div className="space-y-2">
                <Label htmlFor="bank-name">Nama Bank</Label>
                <Input id="bank-name" value={modalBankName} onChange={(e) => setModalBankName(e.target.value)} placeholder="Contoh: BCA" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="destination-number">
                {modalType === 'phone' ? 'Nomor HP' : 'Nomor Rekening'}
              </Label>
              <Input id="destination-number" value={modalInputValue} onChange={(e) => setModalInputValue(e.target.value)} placeholder={modalType === 'phone' ? '0812...' : '123456...'} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleModalSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};