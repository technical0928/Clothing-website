"use client";
import { SectionTitle } from "@/components";
import config from "@/lib/config";
import { isValidEmailAddressFormat } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaEnvelope } from "react-icons/fa6";

// Show only the first character of the local part, e.g. a****@gmail.com,
// so a full email address is never exposed on screen.
const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 1)}****@${domain}`;
};

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [demo, setDemo] = useState<{ otp: string; email: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidEmailAddressFormat(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/password-reset/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Something went wrong. Please try again.");
        return;
      }
      // Console mode (SMTP not configured): show the code on screen so the
      // flow can still be completed. With real SMTP the code only goes by email.
      if (data.consoleMode && data.demoOtp) {
        setDemo({ otp: String(data.demoOtp), email: String(data.email || email.trim()) });
        toast.success("Verification code generated (demo mode)");
        return;
      }
      toast.success("Verification code sent");
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      console.error("Forgot password request failed:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      <SectionTitle title="Forgot Password" path="Home | Forgot Password" />
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-normal leading-9 tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your account email and we will send you a 6-digit verification
            code to choose a new password.
          </p>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-[480px]">
          {demo && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-6 py-5 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Demo mode — email service not configured yet
              </p>
              <p className="mt-2 text-sm text-amber-800">
                Your verification code is:
              </p>
              <p className="mt-1 text-3xl font-bold tracking-[0.4em] text-amber-900">
                {demo.otp}
              </p>
              <p className="mt-2 text-xs text-amber-700">
                Sent to {maskEmail(demo.email)} — this code will expire in 5
                minutes. Once you add SMTP credentials in Admin Settings, codes
                are sent by email instead.
              </p>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/forgot-password/verify?email=${encodeURIComponent(demo.email)}`
                  )
                }
                className="mt-4 w-full rounded-md bg-stone-900 px-3 py-2 text-sm font-bold uppercase text-white hover:bg-stone-800"
              >
                Continue to verification →
              </button>
            </div>
          )}
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                  Email address
                </label>
                <div className="relative mt-2">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 pl-9 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center rounded-md bg-stone-900 px-3 py-2 text-sm font-bold uppercase text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {submitting ? "Sending code..." : "Send verification code"}
              </button>

              <div className="text-center text-sm text-gray-600">
                Remembered it?{" "}
                <Link href="/login" className="font-semibold text-black hover:text-amber-700">
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
