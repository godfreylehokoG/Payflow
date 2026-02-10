"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import AmountInput from "@/components/forms/AmountInput";
import FeeNotice from "@/components/ui/FeeNotice";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import BottomNav from "@/components/ui/BottomNav";
import { fetchMerchantById } from "@/lib/merchants";
import { processSend } from "@/lib/transactions";
import { useUser } from "@/hooks/useUser";
import { formatCurrency } from "@/lib/utils";
import type { Merchant } from "@/types";

const FEE = 1;

export default function MerchantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const numericAmount = Number(amount || 0);
  const total = numericAmount + FEE;

  useEffect(() => {
    if (!params?.id) return;
    fetchMerchantById(String(params.id))
      .then((data) => setMerchant(data))
      .catch(() => setMerchant(null));
  }, [params?.id]);

  const canSubmit = useMemo(() => {
    if (!user || !merchant) return false;
    if (numericAmount < 1 || numericAmount > 5000) return false;
    if (user.wallet_balance < total) return false;
    return true;
  }, [user, merchant, numericAmount, total]);

  async function handlePay() {
    setError("");
    if (!canSubmit || !user || !merchant) {
      setError("Please check the details and try again.");
      return;
    }
    setLoading(true);
    try {
      await processSend({
        senderId: user.id,
        merchantId: merchant.id,
        amount: numericAmount,
      });
      alert("Payment successful.");
      router.push("/home");
    } catch (err: any) {
      setError(err?.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!merchant) {
    return (
      <>
        <PageHeader title="Shop" />
        <Card>
          <p className="text-sm text-slate-500">Merchant not found.</p>
        </Card>
        <BottomNav active="shops" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Pay Merchant" />
      <Card>
        <div className="text-lg font-semibold text-slate-900">
          {merchant.name}
        </div>
        <div className="mt-1 text-xs text-slate-500 capitalize">
          {merchant.category.replace("_", " ")} • {merchant.address || "Local"}
        </div>
        <div className="text-xs text-slate-400">{merchant.distance || "--"}</div>
      </Card>

      <div className="mt-4 space-y-4">
        <AmountInput
          label="Payment Amount"
          value={amount}
          onChange={setAmount}
          error={error}
        />
        <FeeNotice fee={FEE} total={total} />
        <div className="text-sm text-slate-500">
          Available: {formatCurrency(user?.wallet_balance || 0)}
        </div>
        <Button loading={loading} onClick={handlePay} disabled={!canSubmit}>
          Pay Now
        </Button>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>

      <BottomNav active="shops" />
    </>
  );
}
