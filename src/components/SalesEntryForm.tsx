"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  CommandList,
} from "@/components/ui/command";

interface Customer {
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface SalesEntryFormProps {
  onAddSale: (sale: {
    name: string;
    destination: string;
    bankName?: string;
    amount: number;
    adminFee: number;
    category: string;
    productId?: string;
  }) => void;
  previousCustomers: Customer[];
  userId: string;
}

const categories = [
  "Transfer Antar Bank", "Transfer Beda Bank", "DANA", "Gopay", "OVO", "Tunai", "Lainnya",
];
const eWalletCategories = ["DANA", "Gopay", "OVO"];
const bankCategories = ["Transfer Antar Bank", "Transfer Beda Bank"];

export const SalesEntryForm = ({ onAddSale, previousCustomers, userId }: SalesEntryFormProps) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [adminFee, setAdminFee] = useState("");
  const [category, setCategory] = useState("");
  const [customerComboboxOpen, setCustomerComboboxOpen] = useState(false);
  const [productComboboxOpen, setProductComboboxOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["products", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price")
        .eq("user_id", userId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (selectedProduct) {
      setAmount(selectedProduct.price.toString());
    }
  }, [selectedProduct]);

  const [destination, setDestination] = useState("");
  const [bankName, setBankName] = useState("");
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
      setIsModalOpen(true);
    } else if (bankCategories.includes(value)) {
      setModalType("bank");
      setIsModalOpen(true);
    }
  };

  const handleModalSave = () => {
    if (modalType === "phone") setDestination(modalInputValue);
    else if (modalType === "bank") {
      setDestination(modalInputValue);
      setBankName(modalBankName);
    }
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !selectedProduct) {
      showError("Produk, Nominal, dan Kategori harus diisi.");
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
      productId: selectedProduct.id,
    });
    showSuccess("Penjualan berhasil dicatat!");

    setName(""); setAmount(""); setAdminFee(""); setCategory(""); setDestination(""); setBankName(""); setSelectedProduct(null);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader><CardTitle>Catat Penjualan Baru</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Produk/Layanan</Label>
              <Popover open={productComboboxOpen} onOpenChange={setProductComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {selectedProduct ? selectedProduct.name : "Pilih produk..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Cari produk..." />
                    <CommandList>
                      <CommandEmpty>{isLoadingProducts ? "Memuat..." : "Produk tidak ditemukan."}</CommandEmpty>
                      <CommandGroup>
                        {products?.map((p) => <CommandItem key={p.id} value={p.name} onSelect={() => { setSelectedProduct(p); setProductComboboxOpen(false); }}>{p.name}</CommandItem>)}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Pelanggan (Opsional)</Label>
              <Popover open={customerComboboxOpen} onOpenChange={setCustomerComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                    {name || "Pilih atau ketik nama..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Cari atau masukkan nama baru..." value={name} onValueChange={setName} />
                    <CommandList>
                      <CommandEmpty>Nama tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {previousCustomers.map((c) => <CommandItem key={c.name} value={c.name} onSelect={(val) => { setName(val); setCustomerComboboxOpen(false); }}>{c.name}</CommandItem>)}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori Pembayaran</Label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
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
              <Input id="amount" type="text" value={formatCurrency(amount)} readOnly className="bg-muted" />
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
          <DialogHeader><DialogTitle>{modalType === 'phone' ? 'Masukkan Nomor Tujuan' : 'Masukkan Detail Rekening'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            {modalType === 'bank' && (<div className="space-y-2"><Label htmlFor="bank-name">Nama Bank</Label><Input id="bank-name" value={modalBankName} onChange={(e) => setModalBankName(e.target.value)} placeholder="Contoh: BCA" /></div>)}
            <div className="space-y-2"><Label htmlFor="destination-number">{modalType === 'phone' ? 'Nomor HP' : 'Nomor Rekening'}</Label><Input id="destination-number" value={modalInputValue} onChange={(e) => setModalInputValue(e.target.value)} placeholder={modalType === 'phone' ? '0812...' : '123456...'} /></div>
          </div>
          <DialogFooter><Button onClick={handleModalSave}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};