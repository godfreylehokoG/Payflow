"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/ui/BottomNav";
import PageHeader from "@/components/layout/PageHeader";
import PhoneInput from "@/components/forms/PhoneInput";
import AmountInput from "@/components/forms/AmountInput";
import FeeNotice from "@/components/ui/FeeNotice";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useUser } from "@/hooks/useUser";
import { fetchMerchants } from "@/lib/merchants";
import { processSend } from "@/lib/transactions";
import { formatCurrency, isValidSouthAfricanPhone } from "@/lib/utils";
import type { Merchant } from "@/types";

const FEE = 1.0;

export default function SendPage() {
  const { user } = useUser();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const numericAmount = Number(amount || 0);
  const total = numericAmount + FEE;

  const canSubmit = useMemo(() => {
    if (!user) return false;
    if (!isValidSouthAfricanPhone(recipient)) return false;
    if (recipient === user.phone_number) return false;
    if (numericAmount < 1 || numericAmount > 5000) return false;
    if (user.wallet_balance < total) return false;
    return true;
  }, [recipient, numericAmount, user, total]);

  useEffect(() => {
    fetchMerchants()
      .then((data) => setMerchants(data.slice(0, 3)))
      .catch(() => setMerchants([]));
  }, []);

  async function handleSend() {
    setError("");
    if (!canSubmit || !user) {
      setError("Please check the details and try again.");
      return;
    }
    setLoading(true);
    try {
      await processSend({
        senderId: user.id,
        recipientPhone: recipient,
        amount: numericAmount,
      });
      setRecipient("");
      setAmount("");
      alert("Transfer successful.");
    } catch (err: any) {
      setError(err?.message || "Transfer failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Send Money" />
      <div className="space-y-4">
        <PhoneInput
          label="Recipient Phone Number"
          value={recipient}
          onChange={setRecipient}
          error={error}
        />
        <AmountInput
          label="Amount"
          value={amount}
          onChange={setAmount}
          error={error}
        />
        <FeeNotice fee={FEE} total={total} />
        <div className="text-sm text-slate-500">
          Available: {formatCurrency(user?.wallet_balance || 0)}
        </div>
        <Button loading={loading} onClick={handleSend} disabled={!canSubmit}>
          Send
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Quick Pay</h2>
        {merchants.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500">
              Nearby shops will appear here once available.
            </p>
          </Card>
        ) : (
          merchants.map((merchant) => (
            <Card key={merchant.id}>
              <div className="text-sm font-semibold text-slate-900">
                {merchant.name}
              </div>
              <div className="text-xs text-slate-500 capitalize">
                {merchant.category.replace("_", " ")} • {merchant.distance || "--"}
              </div>
            </Card>
          ))
        )}
      </div>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      <BottomNav active="send" />
    </>
  );
}
