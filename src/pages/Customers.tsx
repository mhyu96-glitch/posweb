"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Customer {
  phone: string;
  name: string;
  transaction_count: number;
  total_spent: number;
  last_transaction: string;
}

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["customers", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data: sales, error } = await supabase
        .from("sales")
        .select("customer_name, phone, amount, admin_fee, created_at")
        .eq("user_id", session.user.id);

      if (error) throw error;

      const customerMap = new Map<string, {
        name: string;
        phone: string;
        transaction_count: number;
        total_spent: number;
        last_transaction: Date;
      }>();

      sales.forEach(sale => {
        if (!sale.phone) return;

        const existingCustomer = customerMap.get(sale.phone);
        const saleTotal = sale.amount + (sale.admin_fee || 0);
        const saleDate = new Date(sale.created_at);

        if (existingCustomer) {
          existingCustomer.transaction_count += 1;
          existingCustomer.total_spent += saleTotal;
          if (saleDate > existingCustomer.last_transaction) {
            existingCustomer.last_transaction = saleDate;
            if (sale.customer_name) {
              existingCustomer.name = sale.customer_name;
            }
          }
        } else {
          customerMap.set(sale.phone, {
            phone: sale.phone,
            name: sale.customer_name || "Tanpa Nama",
            transaction_count: 1,
            total_spent: saleTotal,
            last_transaction: saleDate,
          });
        }
      });

      const customerList = Array.from(customerMap.values()).map(c => ({
        ...c,
        last_transaction: c.last_transaction.toISOString(),
      }));

      customerList.sort((a, b) => new Date(b.last_transaction).getTime() - new Date(a.last_transaction).getTime());

      return customerList;
    },
    enabled: !!session?.user?.id,
  });

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!searchTerm) return customers;

    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const handleRowClick = (phone: string) => {
    navigate(`/customers/${phone}`);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <main className="space-y-6">
        <h1 className="text-3xl font-bold">Manajemen Pelanggan</h1>
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pelanggan</CardTitle>
            <div className="mt-4">
              <Input
                placeholder="Cari berdasarkan nama atau nomor HP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pelanggan</TableHead>
                    <TableHead>Nomor HP</TableHead>
                    <TableHead className="text-center">Jumlah Transaksi</TableHead>
                    <TableHead className="text-right">Total Belanja (Rp)</TableHead>
                    <TableHead className="text-right">Transaksi Terakhir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell className="text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-36 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.phone} onClick={() => handleRowClick(customer.phone)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="text-center">{customer.transaction_count}</TableCell>
                        <TableCell className="text-right">{customer.total_spent.toLocaleString("id-ID")}</TableCell>
                        <TableCell className="text-right">
                          {format(new Date(customer.last_transaction), "d MMM yyyy, HH:mm", { locale: id })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Tidak ada data pelanggan.
                      </TableCell>
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