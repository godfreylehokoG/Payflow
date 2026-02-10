"use client";

import Link from "next/link";
import { Banknote, HandCoins, Send, Store } from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";
import Card from "@/components/ui/Card";
import BalanceDisplay from "@/components/ui/BalanceDisplay";
import TransactionItem from "@/components/ui/TransactionItem";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import { useUser } from "@/hooks/useUser";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const { user, loading: userLoading } = useUser();
  const { transactions, loading: txLoading, refresh } = useTransactions(user?.id);

  if (userLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageHeader title="Home" />

      <Card>
        <div className="text-sm text-slate-500">Wallet</div>
        <BalanceDisplay amount={user?.wallet_balance || 0} />
      </Card>

      <div className="mt-4 grid grid-cols-4 gap-3 text-center text-xs text-slate-600">
        <Link
          href="/send"
          className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
        >
          <Send size={18} className="text-blue-600" />
          Send
        </Link>
        <Link
          href="/shops"
          className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
        >
          <Store size={18} className="text-blue-600" />
          Shops
        </Link>
        <Link
          href="/withdraw"
          className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
        >
          <Banknote size={18} className="text-blue-600" />
          Withdraw
        </Link>
        <Link
          href="/borrow"
          className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 bg-white p-3 shadow-sm"
        >
          <HandCoins size={18} className="text-blue-600" />
          Borrow
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          Transaction History
        </h2>
        <button
          className="text-xs text-blue-600"
          onClick={() => refresh()}
        >
          Refresh
        </button>
      </div>

      {txLoading ? (
        <LoadingSpinner />
      ) : transactions.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No transactions yet. Your balance is {formatCurrency(user?.wallet_balance || 0)}.
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {transactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}

      <BottomNav active="home" />
    </>
  );
}
