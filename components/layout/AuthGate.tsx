"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        router.push("/login");
      } else {
        setChecking(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
