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

interface Product {
  id: string;
  name: string;
  price: number;
}

interface SalesEntryFormProps {
  onAddSale: (sale: {
    name: string;
    phone: string;
    amount: number;
    adminFee: number;
    category: string;
    productId?: string;
  }) => void;
  previousCustomers: Customer[];
  products: Product[];
}

const categories = [
  "Transfer Antar Bank",
  "Transfer Beda Bank",
  "DANA",
  "Gopay",
  "OVO",
  "Tunai",
  "Lainnya",
];

export const SalesEntryForm = ({
  onAddSale,
  previousCustomers,
  products,
}: SalesEntryFormProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [adminFee, setAdminFee] = useState("");
  const [category, setCategory] = useState("");
  const [productId, setProductId] = useState<string | undefined>();
  const [open, setOpen] = useState(false);

  const handleNumericInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setter(rawValue);
  };
  
  const formatCurrency = (value: string) => {
    if (!value) return "";
    return new Intl.NumberFormat("id-ID").format(Number(value));
  };

  const handleProductChange = (selectedProductId: string) => {
    const product = products.find((p) => p.id === selectedProductId);
    if (product) {
      setProductId(product.id);
      setAmount(product.price.toString());
      // Otomatis mengisi kategori jika nama produk cocok
      const matchingCategory = categories.find(cat => product.name.toLowerCase().includes(cat.toLowerCase()));
      if (matchingCategory) {
        setCategory(matchingCategory);
      }
    } else {
      setProductId(undefined);
      setAmount("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !amount || !category) {
      showError("Nomor HP, Nominal, dan Kategori harus diisi.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showError("Nominal harus berupa angka positif.");
      return;
    }
    
    const numericAdminFee = parseFloat(adminFee) || 0;
     if (isNaN(numericAdminFee) || numericAdminFee < 0) {
      showError("Biaya admin harus berupa angka positif.");
      return;
    }

    onAddSale({ name, phone, amount: numericAmount, adminFee: numericAdminFee, category, productId });
    showSuccess("Penjualan berhasil dicatat!");

    // Reset form
    setName("");
    setPhone("");
    setAmount("");
    setAdminFee("");
    setCategory("");
    setProductId(undefined);
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
            <Label>Produk / Layanan</Label>
            <Select onValueChange={handleProductChange} value={productId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih produk atau isi manual" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - Rp {product.price.toLocaleString('id-ID')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            <Label htmlFor="category">Kategori Penjualan</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori pembayaran" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Nominal Penjualan (Rp)</Label>
            <Input
              id="amount"
              type="text"
              inputMode="numeric"
              placeholder="Contoh: 50000"
              value={formatCurrency(amount)}
              onChange={(e) => handleNumericInputChange(e, setAmount)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-fee">Biaya Admin (Rp)</Label>
            <Input
              id="admin-fee"
              type="text"
              inputMode="numeric"
              placeholder="Contoh: 2500"
              value={formatCurrency(adminFee)}
              onChange={(e) => handleNumericInputChange(e, setAdminFee)}
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