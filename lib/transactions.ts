import { supabase } from "@/lib/supabase";
import type { Transaction } from "@/types";

export async function fetchTransactions(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Transaction[]>();

  if (error) throw error;
  return data || [];
}

export async function processSend(input: {
  senderId: string;
  recipientPhone?: string;
  merchantId?: string;
  amount: number;
}) {
  const { data, error } = await supabase.functions.invoke("process-send", {
    body: input,
  });
  if (error) throw error;
  return data;
}

export async function processWithdraw(input: {
  userId: string;
  amount: number;
  merchantId: string;
}) {
  const { data, error } = await supabase.functions.invoke("process-withdraw", {
    body: input,
  });
  if (error) throw error;
  return data;
}

export async function processBorrow(input: {
  userId: string;
  amount: number;
  purpose: string;
}) {
  const { data, error } = await supabase.functions.invoke("process-borrow", {
    body: input,
  });
  if (error) throw error;
  return data;
}
