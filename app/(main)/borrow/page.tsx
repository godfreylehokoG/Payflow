"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import AmountInput from "@/components/forms/AmountInput";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import BottomNav from "@/components/ui/BottomNav";
import { useUser } from "@/hooks/useUser";
import { useTransactions } from "@/hooks/useTransactions";
import { fetchActiveBorrow } from "@/lib/borrows";
import { processBorrow } from "@/lib/transactions";
import { formatCurrency } from "@/lib/utils";
import type { Borrow } from "@/types";

const FEE = 1.5;

export default function BorrowPage() {
  const { user } = useUser();
  const { transactions } = useTransactions(user?.id);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("food");
  const [agree, setAgree] = useState(false);
  const [activeBorrow, setActiveBorrow] = useState<Borrow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const numericAmount = Number(amount || 0);
  const dueDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const creditLimit = transactions.length >= 10 ? 500 : 300;
  const eligible =
    !activeBorrow && transactions.length >= 3 && (user?.wallet_balance ?? 0) >= 0;

  useEffect(() => {
    if (!user) return;
    fetchActiveBorrow(user.id)
      .then((data) => setActiveBorrow(data || null))
      .catch(() => setActiveBorrow(null));
  }, [user]);

  const canBorrow =
    eligible &&
    agree &&
    numericAmount >= 10 &&
    numericAmount <= creditLimit &&
    !!user;

  async function handleBorrow() {
    setError("");
    if (!canBorrow || !user) {
      setError("Please check eligibility and amount.");
      return;
    }
    setLoading(true);
    try {
      await processBorrow({
        userId: user.id,
        amount: numericAmount,
        purpose,
      });
      setAmount("");
      setAgree(false);
      alert("Borrow request approved.");
    } catch (err: any) {
      setError(err?.message || "Borrow failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Borrow Money" />
      <Card className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Eligibility</div>
        <p className="mt-1 text-xs text-slate-500">
          {eligible
            ? `You qualify. Credit limit: ${formatCurrency(creditLimit)}`
            : "Complete at least 3 transactions and repay any active loans to qualify."}
        </p>
      </Card>

      <div className="space-y-4">
        <AmountInput
          label="Borrow Amount"
          value={amount}
          onChange={setAmount}
          error={error}
        />
        <label className="block text-sm text-slate-700">
          <span className="mb-2 block font-medium">What is this for?</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm"
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
          >
            <option value="food">Food</option>
            <option value="airtime">Airtime</option>
            <option value="transport">Transport</option>
            <option value="other">Other</option>
          </select>
        </label>

        <Card>
          <div className="text-sm text-slate-600">
            Borrowing Fee: <strong>{formatCurrency(FEE)}</strong>
          </div>
          <div className="text-sm text-slate-600">
            Amount to Repay:{" "}
            <strong>{formatCurrency(numericAmount + FEE)}</strong>
          </div>
          <div className="text-sm text-slate-600">Due Date: {dueDate}</div>
          <label className="mt-3 flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={agree}
              onChange={(event) => setAgree(event.target.checked)}
            />
            I agree to repay within 7 days
          </label>
        </Card>

        <Button loading={loading} onClick={handleBorrow} disabled={!canBorrow}>
          Borrow Now
        </Button>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>

      {activeBorrow ? (
        <Card className="mt-6 border-amber-100 bg-amber-50">
          <div className="text-sm font-semibold text-amber-900">
            Active Loan
          </div>
          <div className="mt-1 text-xs text-amber-700">
            Amount: {formatCurrency(activeBorrow.amount)} • Due:{" "}
            {activeBorrow.due_date
              ? new Date(activeBorrow.due_date).toLocaleDateString("en-ZA")
              : "--"}
          </div>
          <Button className="mt-3" variant="outline">
            Repay Now
          </Button>
        </Card>
      ) : null}

      <BottomNav active="home" />
    </>
  );
}
