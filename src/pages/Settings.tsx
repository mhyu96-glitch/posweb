"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

const settingsFormSchema = z.object({
  shop_name: z.string().min(1, "Nama toko harus diisi."),
  shop_address: z.string().optional(),
  shop_phone: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const Settings = () => {
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
  });

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["settings", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("settings")
        .select("shop_name, shop_address, shop_phone")
        .eq("user_id", session.user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      shop_name: "",
      shop_address: "",
      shop_phone: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        shop_name: settings.shop_name || "",
        shop_address: settings.shop_address || "",
        shop_phone: settings.shop_phone || "",
      });
    }
  }, [settings, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    if (!session?.user?.id) {
      showError("Sesi tidak ditemukan. Silakan login kembali.");
      return;
    }
    try {
      const { error } = await supabase.from("settings").upsert({
        user_id: session.user.id,
        shop_name: data.shop_name,
        shop_address: data.shop_address,
        shop_phone: data.shop_phone,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (error) throw error;

      showSuccess("Pengaturan berhasil disimpan!");
      queryClient.invalidateQueries({ queryKey: ["settings", session.user.id] });
    } catch (error) {
      showError("Gagal menyimpan pengaturan.");
    }
  };

  if (isSettingsLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-20 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-10 w-full" /></div>
            <Skeleton className="h-10 w-1/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Pengaturan Toko</CardTitle>
          <CardDescription>
            Atur informasi toko Anda. Informasi ini akan ditampilkan di struk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="shop_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Toko</FormLabel>
                    <FormControl><Input placeholder="Masukkan nama toko Anda" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shop_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Toko (Opsional)</FormLabel>
                    <FormControl><Textarea placeholder="Masukkan alamat toko" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shop_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon Toko (Opsional)</FormLabel>
                    <FormControl><Input placeholder="Masukkan nomor telepon" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;