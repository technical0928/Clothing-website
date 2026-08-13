"use client";
import { SectionTitle } from "@/components";
import { Loader } from "@/components/Loader";
import config from "@/lib/config";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa6";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") || "").trim();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // The verified OTP was kept in sessionStorage by the verify page
    const otp = sessionStorage.getItem("pwdResetOtp") || "";
    if (!otp) {
      toast.error("Your verification expired. Please verify your code again.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/password-reset/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to reset password");
        return;
      }
      sessionStorage.removeItem("pwdResetOtp");
      toast.success(data.message || "Password reset successfully");
      setDone(true);
    } catch (error) {
      console.error("Reset password failed:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-5 text-center">
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          <p className="font-semibold">Password reset successfully.</p>
          <p className="mt-1">You can now log in with your new password.</p>
        </div>
        <Link
          href="/login"
          className="flex w-full justify-center rounded-md bg-stone-900 px-3 py-2 text-sm font-bold uppercase text-white hover:bg-stone-800"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const inputClass =
    "block w-full rounded-md border-0 py-1.5 pl-9 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6";

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="new-password" className="block text-sm font-medium leading-6 text-gray-900">
          New password
        </label>
        <div className="relative mt-2">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="new-password"
            name="newPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">At least 8 characters</p>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-gray-900">
          Confirm new password
        </label>
        <div className="relative mt-2">
          <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="confirm-password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full justify-center rounded-md bg-stone-900 px-3 py-2 text-sm font-bold uppercase text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {submitting ? "Resetting password..." : "Reset password"}
      </button>
    </form>
  );
}

const ResetPasswordPage = () => {
  return (
    <div className="bg-white">
      <SectionTitle title="Reset Password" path="Home | Reset Password" />
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-normal leading-9 tracking-tight text-gray-900">
            Choose a new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <Suspense fallback={<Loader />}>
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
