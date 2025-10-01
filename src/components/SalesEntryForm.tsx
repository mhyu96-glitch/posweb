"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { CurrencyInput } from "@/components/CurrencyInput";

const salesSchema = z.object({
  name: z.string().optional(),
  destination: z.string().min(1, "Tujuan tidak boleh kosong."),
  bankName: z.string().optional(),
  amount: z.coerce.number().min(1, "Nominal harus lebih dari 0."),
  adminFee: z.coerce.number().min(0, "Biaya admin tidak boleh negatif.").default(0),
  category: z.string().min(1, "Kategori tidak boleh kosong."),
});

type SalesFormValues = z.infer<typeof salesSchema>;

interface SalesEntryFormProps {
  onAddSale: (sale: SalesFormValues) => void;
  previousCustomers: { name: string }[];
}

export const SalesEntryForm = ({ onAddSale, previousCustomers }: SalesEntryFormProps) => {
  const [isBankTransfer, setIsBankTransfer] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [destinationNumber, setDestinationNumber] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [displayInfo, setDisplayInfo] = useState("");

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      name: "",
      destination: "",
      bankName: "",
      amount: undefined,
      adminFee: 0,
      category: "",
    },
  });

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setIsBankTransfer(value === "Transfer Bank");
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    if (!destinationNumber) {
      alert("Nomor tujuan tidak boleh kosong.");
      return;
    }
    form.setValue("category", selectedCategory);
    form.setValue("destination", destinationNumber);
    setDisplayInfo(`${selectedCategory}: ${destinationNumber}`);
    setIsModalOpen(false);
    setDestinationNumber("");
  };

  const onSubmit = (values: SalesFormValues) => {
    onAddSale(values);
    form.reset({
      name: "",
      destination: "",
      bankName: "",
      amount: undefined,
      adminFee: 0,
      category: "",
    });
    setIsBankTransfer(false);
    setDisplayInfo("");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Catat Penjualan Baru</CardTitle>
          <CardDescription>Isi detail transaksi di bawah ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pelanggan (Opsional)</FormLabel>
                    <FormControl>
                      <Input list="customers" placeholder="Contoh: Budi" {...field} />
                    </FormControl>
                    <datalist id="customers">
                      {previousCustomers.map((customer, index) => (
                        <option key={index} value={customer.name} />
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select onValueChange={handleCategoryChange} value="">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori transaksi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pulsa">Pulsa</SelectItem>
                    <SelectItem value="Paket Data">Paket Data</SelectItem>
                    <SelectItem value="Token Listrik">Token Listrik</SelectItem>
                    <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                {displayInfo && (
                  <p className="text-sm text-muted-foreground mt-2 p-2 bg-secondary rounded-md">
                    {displayInfo}
                  </p>
                )}
                <FormMessage>{form.formState.errors.category?.message}</FormMessage>
              </FormItem>

              {isBankTransfer && (
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Bank</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: BCA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominal</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="Contoh: 50.000"
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adminFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biaya Admin</FormLabel>
                    <FormControl>
                      <CurrencyInput
                        placeholder="Contoh: 2.500"
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Masukkan Detail Tujuan</DialogTitle>
            <DialogDescription>
              Masukkan nomor tujuan untuk kategori: <strong>{selectedCategory}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={isBankTransfer ? "Nomor Rekening" : "Nomor Tujuan"}
              value={destinationNumber}
              onChange={(e) => setDestinationNumber(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button onClick={handleModalSubmit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};