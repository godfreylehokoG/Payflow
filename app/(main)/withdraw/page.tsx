"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import AmountInput from "@/components/forms/AmountInput";
import FeeNotice from "@/components/ui/FeeNotice";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import BottomNav from "@/components/ui/BottomNav";
import { useUser } from "@/hooks/useUser";
import { fetchMerchants } from "@/lib/merchants";
import { processWithdraw } from "@/lib/transactions";
import { formatCurrency } from "@/lib/utils";
import type { Merchant } from "@/types";

const FEE = 5;

export default function WithdrawPage() {
  const { user } = useUser();
  const [amount, setAmount] = useState("");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const numericAmount = Number(amount || 0);
  const total = numericAmount + FEE;

  useEffect(() => {
    fetchMerchants()
      .then((data) =>
        setMerchants(
          data.filter((m) => ["spaza", "agent"].includes(m.category))
        )
      )
      .catch(() => setMerchants([]));
  }, []);

  const canSubmit = useMemo(() => {
    if (!user) return false;
    if (numericAmount < 20 || numericAmount > 2000) return false;
    if (!selected) return false;
    if (user.wallet_balance < total) return false;
    return true;
  }, [numericAmount, selected, user, total]);

  async function handleWithdraw() {
    setError("");
    if (!canSubmit || !user) {
      setError("Please check the details and try again.");
      return;
    }
    setLoading(true);
    try {
      const response = await processWithdraw({
        userId: user.id,
        amount: numericAmount,
        merchantId: selected,
      });
      setCode(response?.code || "WTH-" + Math.floor(Math.random() * 999999));
    } catch (err: any) {
      setError(err?.message || "Withdrawal failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Withdraw Cash" />
      <div className="space-y-4">
        <AmountInput
          label="Withdrawal Amount"
          value={amount}
          onChange={setAmount}
          error={error}
        />
        <div>
          <div className="mb-2 text-sm font-medium text-slate-700">
            Select Withdrawal Point
          </div>
          <div className="space-y-2">
            {merchants.map((merchant) => (
              <label
                key={merchant.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 bg-white p-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {merchant.name}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {merchant.category.replace("_", " ")} •{" "}
                    {merchant.distance || "--"}
                  </div>
                </div>
                <input
                  type="radio"
                  name="merchant"
                  checked={selected === merchant.id}
                  onChange={() => setSelected(merchant.id)}
                />
              </label>
            ))}
          </div>
        </div>
        <FeeNotice fee={FEE} total={total} label="Withdrawal Fee" />
        <div className="text-sm text-slate-500">
          Available: {formatCurrency(user?.wallet_balance || 0)}
        </div>
        <Button loading={loading} onClick={handleWithdraw} disabled={!canSubmit}>
          Confirm Withdrawal
        </Button>

        {code ? (
          <Card className="border-blue-100 bg-blue-50">
            <div className="text-sm font-semibold text-blue-900">
              Withdrawal Code
            </div>
            <div className="mt-2 text-2xl font-bold tracking-wider text-blue-900">
              {code}
            </div>
            <p className="mt-2 text-xs text-blue-700">
              Show this code to the agent. Expires in 24 hours.
            </p>
          </Card>
        ) : null}

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>

      <BottomNav active="home" />
    </>
  );
}
