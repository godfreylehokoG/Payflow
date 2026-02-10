import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
  }).format(amount || 0);
}

export function maskPhone(phone: string) {
  if (!phone) return "";
  const clean = phone.replace(/\s+/g, "");
  if (clean.length < 6) return clean;
  return `${clean.slice(0, 3)} **** ${clean.slice(-4)}`;
}

export function isValidSouthAfricanPhone(phone: string) {
  return /^\+27\d{9}$/.test(phone.replace(/\s+/g, ""));
}
