"use client";
import { SectionTitle } from "@/components";
import config from "@/lib/config";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") || "").trim();

  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch the current resend cooldown from the server on mount
  const refreshCooldown = useCallback(async () => {
    if (!email) return;
    try {
      const res = await fetch(
        `${config.apiBaseUrl}/api/password-reset/status?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (data && typeof data.resendAfterMs === "number" && data.resendAfterMs > 0) {
        setCooldown(Math.ceil(data.resendAfterMs / 1000));
      }
    } catch (error) {
      // silent — countdown is only a UI nicety
    }
  }, [email]);

  useEffect(() => {
    refreshCooldown();
  }, [refreshCooldown]);

  // Tick the countdown down every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown > 0]);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearTimeout(cooldownRef.current);
    };
  }, []);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setVerifying(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/password-reset/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Verification failed");
        return;
      }
      // Keep the code in sessionStorage so the reset page can re-validate it
      sessionStorage.setItem("pwdResetOtp", otp);
      toast.success("Code verified — choose a new password");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Verify failed:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/password-reset/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Could not resend the code");
        return;
      }
      toast.success("New code sent");
      setOtp("");
      setCooldown(60);
    } catch (error) {
      console.error("Resend failed:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white">
      <SectionTitle title="Verify Code" path="Home | Verify Code" />
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-normal leading-9 tracking-tight text-gray-900">
            Enter verification code
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit code sent to <strong>{email || "your email"}</strong>.
            The code expires in 5 minutes.
          </p>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleVerify}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium leading-6 text-gray-900">
                  6-digit verification code
                </label>
                <input
                  id="otp"
                  name="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="483921"
                  className="mt-2 block w-full rounded-md border-0 py-3 text-center text-2xl font-bold tracking-[0.5em] text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:font-normal placeholder:text-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="flex w-full justify-center rounded-md bg-stone-900 px-3 py-2 text-sm font-bold uppercase text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {verifying ? "Verifying..." : "Verify code"}
              </button>

              <div className="flex items-center justify-center gap-x-3 text-sm">
                <span className="text-gray-600">Didn&apos;t receive it?</span>
                {cooldown > 0 ? (
                  <span className="font-semibold text-gray-400">
                    Resend in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={resending || !email}
                    onClick={handleResend}
                    className="font-semibold text-black hover:text-amber-700 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    {resending ? "Sending..." : "Resend code"}
                  </button>
                )}
              </div>

              <div className="text-center text-sm text-gray-600">
                <Link href="/forgot-password" className="font-semibold text-black hover:text-amber-700">
                  Use a different email
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const VerifyPageWrapper = () => (
  <Suspense fallback={<div className="bg-white min-h-screen" />}>
    <VerifyPage />
  </Suspense>
);

export default VerifyPageWrapper;
