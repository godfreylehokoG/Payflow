"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "@/components/forms/PhoneInput";
import Button from "@/components/ui/Button";
import { isValidSouthAfricanPhone } from "@/lib/utils";
import { signInWithOtp } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!isValidSouthAfricanPhone(phone)) {
      setError("Enter a valid South African phone number.");
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await signInWithOtp(phone);
      if (authError) throw authError;
      sessionStorage.setItem("flowpay_phone", phone);
      router.push("/verify-otp");
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-600 px-4">
      <div className="w-full max-w-sm text-white">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-white/10" />
          <h1 className="text-2xl font-bold tracking-wide">FLOW PAY</h1>
        </div>

        <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-lg">
          <PhoneInput
            label="Enter your phone number"
            placeholder="81 123 4567"
            value={phone}
            onChange={setPhone}
            error={error}
          />
          <Button
            className="mt-5 bg-blue-600 text-white hover:bg-blue-700"
            loading={loading}
            onClick={handleSubmit}
          >
            Log In
          </Button>
        </div>
      </div>
    </div>
  );
}
