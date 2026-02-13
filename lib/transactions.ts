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
  const { data, error } = await supabase.rpc("process_send", {
    p_sender_id: input.senderId,
    p_amount: input.amount,
    p_recipient_phone: input.recipientPhone || null,
    p_merchant_id: input.merchantId || null,
  });

  if (error) throw error;
  return data;
}

export async function processWithdraw(input: {
  userId: string;
  amount: number;
  merchantId: string;
}) {
  const { data, error } = await supabase.rpc("process_withdraw", {
    p_user_id: input.userId,
    p_amount: input.amount,
    p_merchant_id: input.merchantId,
  });

  if (error) throw error;
  return data;
}

export async function processBorrow(input: {
  userId: string;
  amount: number;
  purpose: string;
}) {
  const { data, error } = await supabase.rpc("process_borrow", {
    p_user_id: input.userId,
    p_amount: input.amount,
    p_purpose: input.purpose,
  });

  if (error) throw error;
  return data;
}
