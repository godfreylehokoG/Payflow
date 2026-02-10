import { supabase } from "@/lib/supabase";
import type { Borrow } from "@/types";

export async function fetchActiveBorrow(userId: string) {
  const { data, error } = await supabase
    .from("borrows")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle<Borrow>();

  if (error) throw error;
  return data;
}

export async function fetchBorrowHistory(userId: string) {
  const { data, error } = await supabase
    .from("borrows")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<Borrow[]>();

  if (error) throw error;
  return data || [];
}
