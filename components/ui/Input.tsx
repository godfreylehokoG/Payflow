import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({
  className,
  label,
  error,
  ...props
}: InputProps) {
  return (
    <label className="block w-full text-sm text-slate-700">
      {label ? <span className="mb-2 block font-medium">{label}</span> : null}
      <input
        className={cn(
          "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
          error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "",
          className
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-500">{error}</span> : null}
    </label>
  );
}
