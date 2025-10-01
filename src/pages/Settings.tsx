"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

const settingsSchema = z.object({
  shop_name: z.string().optional(),
  shop_address: z.string().optional(),
  shop_phone: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const Settings = () => {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
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

  const onSubmit = async (values: SettingsFormValues) => {
    if (!user?.id) {
      showError("Anda harus login untuk menyimpan pengaturan.");
      return;
    }
    try {
      const { error } = await supabase.from("settings").upsert({
        user_id: user.id,
        ...values,
      });
      if (error) throw error;
      showSuccess("Pengaturan berhasil disimpan!");
      queryClient.invalidateQueries({ queryKey: ["settings", user.id] });
    } catch (error) {
      showError("Gagal menyimpan pengaturan.");
      console.error("Error saving settings:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Toko</CardTitle>
          <CardDescription>
            Atur informasi toko Anda. Informasi ini akan ditampilkan pada struk.
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
                    <FormControl>
                      <Input placeholder="Contoh: Toko Serba Ada" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shop_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Toko</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Jl. Merdeka No. 10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shop_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon Toko</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: 081234567890" {...field} />
                    </FormControl>
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