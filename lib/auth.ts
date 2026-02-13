import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";

const isTestMode = process.env.NEXT_PUBLIC_SUPABASE_TEST_MODE === "1";

export async function signInWithOtp(phone: string) {
  if (isTestMode) {
    return { data: {}, error: null };
  }
  return supabase.auth.signInWithOtp({ phone });
}

export async function verifyOtp(phone: string, token: string) {
  if (isTestMode) {
    await supabase.auth.signOut();
    const result = await supabase.auth.signInAnonymously();

    if (result.error) {
      const message = result.error.message.toLowerCase();
      if (message.includes("match") || message.includes("jwt") || message.includes("key")) {
        return {
          data: result.data,
          error: {
            ...result.error,
            message:
              "Supabase URL/key mismatch. Use URL and anon key from the same project in .env.local, then restart dev server.",
          },
        };
      }
      if (message.includes("anonymous")) {
        return {
          data: result.data,
          error: {
            ...result.error,
            message:
              "Enable Anonymous sign-ins in Supabase Dashboard > Authentication > Providers > Anonymous.",
          },
        };
      }
    }

    return result;
  }
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
