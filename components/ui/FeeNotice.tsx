import { formatCurrency } from "@/lib/utils";

type Props = {
  fee: number;
  total: number;
  label?: string;
};

export default function FeeNotice({ fee, total, label }: Props) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
      <div className="flex items-center justify-between">
        <span>{label || "Transaction Fee"}</span>
        <span className="font-semibold">{formatCurrency(fee)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-slate-500">
        <span>Total</span>
        <span className="font-semibold text-slate-900">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
