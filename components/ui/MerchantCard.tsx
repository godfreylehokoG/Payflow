import Link from "next/link";
import { Store } from "lucide-react";
import type { Merchant } from "@/types";

type Props = {
  merchant: Merchant;
};

export default function MerchantCard({ merchant }: Props) {
  return (
    <Link
      href={`/shops/${merchant.id}`}
      className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Store size={18} />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {merchant.name}
          </div>
          <div className="text-xs text-slate-500 capitalize">
            {merchant.category.replace("_", " ")}
          </div>
        </div>
      </div>
      <div className="text-xs text-slate-400">{merchant.distance || "--"}</div>
    </Link>
  );
}
