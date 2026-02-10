"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/forms/OtpInput";
import Button from "@/components/ui/Button";
import { maskPhone } from "@/lib/utils";
import { createUserProfile, getCurrentUser, getUserProfile, signInWithOtp, verifyOtp } from "@/lib/auth";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const stored = sessionStorage.getItem("flowpay_phone") || "";
    if (!stored) {
      router.push("/login");
      return;
    }
    setPhone(stored);
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function handleVerify() {
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await verifyOtp(phone, otp);
      if (authError) throw authError;

      const user = await getCurrentUser();
      if (!user) throw new Error("Unable to load user session.");

      try {
        await getUserProfile(user.id);
      } catch {
        await createUserProfile(phone, user.id);
      }

      router.push("/home");
    } catch (err: any) {
      setError(err?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (countdown > 0) return;
    setError("");
    try {
      await signInWithOtp(phone);
      setCountdown(60);
    } catch (err: any) {
      setError(err?.message || "Failed to resend code.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Verify Your Number
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter the code sent to {maskPhone(phone)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <OtpInput value={otp} onChange={setOtp} />
          {error ? (
            <p className="mt-3 text-center text-xs text-red-500">{error}</p>
          ) : null}
          <Button className="mt-5" loading={loading} onClick={handleVerify}>
            Verify
          </Button>
          <button
            className="mt-4 w-full text-center text-sm text-blue-600 disabled:text-slate-400"
            onClick={handleResend}
            disabled={countdown > 0}
          >
            Resend Code {countdown > 0 ? `(${countdown}s)` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
