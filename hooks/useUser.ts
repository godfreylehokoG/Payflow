import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getUserProfile } from "@/lib/auth";
import type { UserProfile } from "@/types";

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (!sessionUser) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const profile = await getUserProfile(sessionUser.id);
        if (isMounted) setUser(profile);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
