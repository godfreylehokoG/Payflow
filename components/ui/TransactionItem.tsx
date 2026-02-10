import { ArrowDownLeft, ArrowUpRight, Banknote, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types";

type Props = {
  transaction: Transaction;
  currentUserId?: string;
};

export default function TransactionItem({ transaction, currentUserId }: Props) {
  const isIncoming =
    transaction.type === "receive" ||
    (transaction.receiver_id && transaction.receiver_id === currentUserId);

  const icon =
    transaction.type === "withdraw"
      ? Banknote
      : transaction.type === "borrow"
      ? CreditCard
      : isIncoming
      ? ArrowDownLeft
      : ArrowUpRight;

  const Icon = icon;
  const label =
    transaction.type === "withdraw"
      ? "Withdrawn"
      : transaction.type === "borrow"
      ? "Borrowed"
      : isIncoming
      ? "Received"
      : "Sent";

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-blue-600">
          <Icon size={18} />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          <div className="text-xs text-slate-500">
            {transaction.description || transaction.reference || "Flow Pay"}
          </div>
          <div className="text-[11px] text-slate-400">
            {new Date(transaction.created_at).toLocaleString("en-ZA")}
          </div>
        </div>
      </div>
      <div className="text-sm font-semibold text-slate-900">
        {formatCurrency(transaction.amount)}
      </div>
    </div>
  );
}
