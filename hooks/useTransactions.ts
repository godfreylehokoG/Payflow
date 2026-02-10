import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchTransactions } from "@/lib/transactions";
import type { Transaction } from "@/types";

export function useTransactions(userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchTransactions(userId);
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("transactions-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        (payload) => {
          const record = payload.new as Transaction;
          if (
            record?.sender_id === userId ||
            record?.receiver_id === userId
          ) {
            refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh, userId]);

  return { transactions, loading, refresh };
}
