"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function OtpInput({ value, onChange }: Props) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (value.length === 6) {
      inputs.current[5]?.blur();
    }
  }, [value]);

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          value={value[index] || ""}
          onChange={(event) => {
            const digit = event.target.value.replace(/\D/g, "").slice(-1);
            const next = value.split("");
            next[index] = digit;
            onChange(next.join("").slice(0, 6));
            if (digit && index < 5) inputs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !value[index] && index > 0) {
              inputs.current[index - 1]?.focus();
            }
          }}
          inputMode="numeric"
          className={cn(
            "h-12 w-10 rounded-lg border border-slate-200 text-center text-lg font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          )}
        />
      ))}
    </div>
  );
}
