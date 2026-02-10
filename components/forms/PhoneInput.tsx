"use client";

import { useMemo } from "react";
import Input from "@/components/ui/Input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
};

export default function PhoneInput({
  value,
  onChange,
  label,
  placeholder,
  error,
}: Props) {
  const displayValue = useMemo(() => {
    if (!value) return "";
    return value.replace("+27", "").trim();
  }, [value]);

  return (
    <div className="w-full">
      {label ? (
        <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      ) : null}
      <div className="flex items-end gap-2">
        <div className="flex h-[46px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
          +27
        </div>
        <Input
          placeholder={placeholder || "81 123 4567"}
          value={displayValue}
          inputMode="numeric"
          error={error}
          onChange={(event) => {
            const raw = event.target.value.replace(/\D/g, "").slice(0, 9);
            onChange(`+27${raw}`);
          }}
          className="flex-1"
        />
      </div>
    </div>
  );
}
