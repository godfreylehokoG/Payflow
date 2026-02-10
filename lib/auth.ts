import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";

export async function signInWithOtp(phone: string) {
  return supabase.auth.signInWithOtp({ phone });
}

export async function verifyOtp(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: "sms" });
}

export async function getSession() {
  return supabase.auth.getSession();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user || null;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single<UserProfile>();

  if (error) throw error;
  return data;
}

export async function createUserProfile(phone: string, userId: string) {
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: userId,
      phone_number: phone,
      role: "consumer",
      wallet_balance: 0,
      is_verified: true,
    })
    .select()
    .single<UserProfile>();

  if (error) throw error;
  return data;
}
