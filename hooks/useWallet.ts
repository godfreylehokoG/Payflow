import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";

export function useWallet(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single<UserProfile>();

    if (!error) setProfile(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, refresh };
}
