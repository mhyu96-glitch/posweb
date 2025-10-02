"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { showError, showSuccess } from "@/utils/toast";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(1, "Nama pelanggan harus diisi."),
  phone: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface Customer {
  id: string;
  name: string;
  phone: string | null;
}

const Customers = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone")
        .eq("user_id", session.user.id)
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", phone: "" },
  });

  const handleDialogOpen = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    form.reset(customer ? { name: customer.name, phone: customer.phone || "" } : { name: "", phone: "" });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: CustomerFormValues) => {
    if (!session?.user?.id) return;

    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from("customers")
          .update({ ...values })
          .eq("id", editingCustomer.id);
        if (error) throw error;
        showSuccess("Pelanggan berhasil diperbarui!");
      } else {
        const { error } = await supabase
          .from("customers")
          .insert([{ ...values, user_id: session.user.id }]);
        if (error) throw error;
        showSuccess("Pelanggan berhasil ditambahkan!");
      }
      queryClient.invalidateQueries({ queryKey: ["customers", session.user.id] });
      setIsDialogOpen(false);
    } catch (error) {
      showError(`Gagal menyimpan data pelanggan.`);
    }
  };

  const handleDelete = async (customerId: string) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", customerId);
      if (error) throw error;
      showSuccess("Pelanggan berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ["customers", session.user.id] });
    } catch (error) {
      showError("Gagal menghapus pelanggan.");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <main className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manajemen Pelanggan</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogOpen()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Pelanggan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingCustomer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Pelanggan</FormLabel>
                      <FormControl><Input placeholder="Contoh: Budi" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon (Opsional)</FormLabel>
                      <FormControl><Input placeholder="Contoh: 08123456789" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                    <Button type="submit" disabled={form.formState.isSubmitting}>Simpan</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pelanggan</CardTitle>
            <CardDescription>Daftar semua pelanggan yang tersimpan di sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pelanggan</TableHead>
                    <TableHead>Nomor Telepon</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : customers && customers.length > 0 ? (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="icon" onClick={() => handleDialogOpen(customer)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                  <AlertDialogDescription>Tindakan ini akan menghapus data pelanggan secara permanen.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(customer.id)}>Hapus</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">Belum ada pelanggan.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Customers;