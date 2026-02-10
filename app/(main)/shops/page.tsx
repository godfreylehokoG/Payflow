"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import BottomNav from "@/components/ui/BottomNav";
import Input from "@/components/ui/Input";
import MerchantCard from "@/components/ui/MerchantCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { fetchMerchants } from "@/lib/merchants";
import type { Merchant, MerchantCategory } from "@/types";

const tabs: Array<{ label: string; value: MerchantCategory | "all" }> = [
  { label: "All", value: "all" },
  { label: "Spaza", value: "spaza" },
  { label: "Kota", value: "kota" },
  { label: "Street Vendor", value: "street_vendor" },
  { label: "Taxi", value: "taxi" },
];

export default function ShopsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MerchantCategory | "all">("all");

  useEffect(() => {
    fetchMerchants()
      .then((data) => setMerchants(data))
      .catch(() => setMerchants([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return merchants
      .filter((merchant) =>
        category === "all" ? true : merchant.category === category
      )
      .filter((merchant) =>
        merchant.name.toLowerCase().includes(query.toLowerCase())
      );
  }, [merchants, category, query]);

  return (
    <>
      <PageHeader title="Shops" />
      <Input
        placeholder="Search shops..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 text-xs font-medium text-slate-600">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCategory(tab.value)}
            className={`rounded-full border px-4 py-2 ${
              category === tab.value
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-slate-200 bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          No merchants found.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      )}

      <BottomNav active="shops" />
    </>
  );
}
