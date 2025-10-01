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
import { useState } from "react";

const salesSchema = z.object({
  name: z.string().optional(),
  destination: z.string().min(1, "Tujuan tidak boleh kosong."),
  bankName: z.string().optional(),
  amount: z.coerce.number().min(1, "Nominal harus lebih dari 0."),
  adminFee: z.coerce.number().min(0, "Biaya admin tidak boleh negatif."),
  category: z.string().min(1, "Kategori tidak boleh kosong."),
});

type SalesFormValues = z.infer<typeof salesSchema>;

interface SalesEntryFormProps {
  onAddSale: (sale: SalesFormValues) => void;
  previousCustomers: { name: string }[];
}

export const SalesEntryForm = ({ onAddSale, previousCustomers }: SalesEntryFormProps) => {
  const [isBankTransfer, setIsBankTransfer] = useState(false);

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      name: "",
      destination: "",
      bankName: "",
      amount: 0,
      adminFee: 0,
      category: "",
    },
  });

  const handleCategoryChange = (value: string) => {
    form.setValue("category", value);
    setIsBankTransfer(value === "Transfer Bank");
  };

  const onSubmit = (values: SalesFormValues) => {
    onAddSale(values);
    form.reset();
    setIsBankTransfer(false);
  };

  return (
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
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={handleCategoryChange} defaultValue={field.value}>
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
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>No. Tujuan / Rekening</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 081234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nominal (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Contoh: 50000" {...field} />
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
                  <FormLabel>Biaya Admin (Rp)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Contoh: 2500" {...field} />
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
  );
};