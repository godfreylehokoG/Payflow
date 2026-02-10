import { supabase } from "@/lib/supabase";
import type { Merchant } from "@/types";

export async function fetchMerchants() {
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("is_active", true)
    .returns<Merchant[]>();

  if (error) throw error;
  return data || [];
}

export async function fetchMerchantById(id: string) {
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("id", id)
    .single<Merchant>();

  if (error) throw error;
  return data;
}
