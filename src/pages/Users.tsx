"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { showError, showSuccess, showLoading, dismissToast } from "@/utils/toast";
import { PlusCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const userSchema = z.object({
  first_name: z.string().min(1, "Nama depan harus diisi."),
  last_name: z.string().optional(),
  username: z.string().min(3, "Username minimal 3 karakter."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  role: z.enum(["admin", "kasir"], { required_error: "Peran harus dipilih." }),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string | null;
  username: string;
  role: "admin" | "kasir";
}

const Users = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: session } = useQuery({ queryKey: ['session'], queryFn: async () => (await supabase.auth.getSession()).data.session });

  const { data: currentUserProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .limit(1);
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!session?.user?.id,
  });

  const { data: users, isLoading: areUsersLoading } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, first_name, last_name, username, role').order('first_name');
      if (error) throw error;
      return data;
    },
    enabled: currentUserProfile?.role === 'admin',
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { first_name: "", last_name: "", username: "", password: "", role: "kasir" },
  });

  useEffect(() => {
    if (!isProfileLoading && currentUserProfile?.role !== 'admin') {
      showError("Akses Ditolak: Anda harus menjadi admin untuk melihat halaman ini.");
      navigate("/");
    }
  }, [currentUserProfile, isProfileLoading, navigate]);

  const onSubmit = async (values: UserFormValues) => {
    const toastId = showLoading("Membuat pengguna baru...");
    try {
      const { error } = await supabase.functions.invoke('create-user', { body: values });
      if (error) throw new Error(error.message);
      
      dismissToast(toastId);
      showSuccess("Pengguna berhasil dibuat!");
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDialogOpen(false);
      form.reset();
    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || "Gagal membuat pengguna.");
    }
  };

  const handleDelete = async (userId: string) => {
    const toastId = showLoading("Menghapus pengguna...");
    try {
      const { error } = await supabase.functions.invoke('delete-user', { body: { userId } });
      if (error) throw new Error(error.message);

      dismissToast(toastId);
      showSuccess("Pengguna berhasil dihapus.");
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || "Gagal menghapus pengguna.");
    }
  };

  if (isProfileLoading || currentUserProfile?.role !== 'admin') {
    return <div className="container mx-auto p-4 md:p-6"><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <main className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Tambah Pengguna</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Tambah Pengguna Baru</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>Nama Depan</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Nama Belakang</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="username" render={({ field }) => (<FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="johndoe" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Peran</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih peran" /></SelectTrigger></FormControl><SelectContent><SelectItem value="kasir">Kasir</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
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
          <CardHeader><CardTitle>Daftar Pengguna</CardTitle><CardDescription>Daftar semua pengguna yang terdaftar di sistem.</CardDescription></CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Username</TableHead><TableHead>Peran</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                <TableBody>
                  {areUsersLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (<TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>))
                  ) : users && users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive" size="icon" disabled={user.id === session?.user?.id}><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle><AlertDialogDescription>Tindakan ini akan menghapus pengguna secara permanen.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(user.id)}>Hapus</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Belum ada pengguna.</TableCell></TableRow>
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

export default Users;