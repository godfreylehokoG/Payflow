import { formatCurrency } from "@/lib/utils";

export default function BalanceDisplay({ amount }: { amount: number }) {
  return (
    <div className="text-3xl font-semibold text-slate-900">
      {formatCurrency(amount)}
    </div>
  );
}
