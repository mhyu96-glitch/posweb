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
  phone: string;
}

interface SalesEntryFormProps {
  onAddSale: (sale: { name: string; phone: string; amount: number }) => void;
  previousCustomers: Customer[];
}

export const SalesEntryForm = ({
  onAddSale,
  previousCustomers,
}: SalesEntryFormProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);

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

    onAddSale({ name, phone, amount: numericAmount });
    showSuccess("Penjualan berhasil dicatat!");

    // Reset form
    setName("");
    setPhone("");
    setAmount("");
  };

  const handleNameSelect = (currentValue: string) => {
    const selectedName = currentValue === name ? "" : currentValue;
    setName(selectedName);

    if (selectedName) {
      const customer = previousCustomers.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase()
      );
      setPhone(customer ? customer.phone : "");
    } else {
      setPhone("");
    }
    setOpen(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Catat Penjualan Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Pelanggan (Opsional)</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between font-normal"
                >
                  {name || "Pilih atau ketik nama..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput
                    placeholder="Cari atau masukkan nama baru..."
                    value={name}
                    onValueChange={setName}
                  />
                  <CommandEmpty>Nama tidak ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {previousCustomers.map((customer) => (
                      <CommandItem
                        key={customer.name}
                        value={customer.name}
                        onSelect={handleNameSelect}
                      >
                        {customer.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor HP Pelanggan</Label>
            <Input
              id="phone"
              type="text"
              placeholder="Contoh: 08123456789"
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