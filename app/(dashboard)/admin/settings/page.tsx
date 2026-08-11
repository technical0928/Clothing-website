"use client";

import { DashboardSidebar } from "@/components";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaEye, FaEyeSlash, FaLock, FaXmark } from "react-icons/fa6";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState(emptyForm);
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasMinimumLength = form.newPassword.length >= 8;
  const passwordsMatch = form.confirmPassword.length > 0 && form.newPassword === form.confirmPassword;

  const canSubmit = useMemo(
    () =>
      form.currentPassword.length > 0 &&
      hasMinimumLength &&
      passwordsMatch &&
      !isSubmitting,
    [form.currentPassword, hasMinimumLength, passwordsMatch, isSubmitting]
  );

  const updateField = (field: PasswordField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleVisibility = (field: PasswordField) => {
    setVisible((current) => ({ ...current, [field]: !current[field] }));
  };

  const submitPasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error("Please complete the password requirements");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to change password");
        return;
      }

      toast.success(data.message || "Password changed successfully");
      setForm(emptyForm);
    } catch (error) {
      console.error("Password change failed:", error);
      toast.error("Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const PasswordInput = ({
    field,
    label,
  }: {
    field: PasswordField;
    label: string;
  }) => (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text text-base font-semibold text-stone-900">{label}</span>
      </div>
      <div className="relative">
        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type={visible[field] ? "text" : "password"}
          className="input input-bordered w-full pl-11 pr-12 bg-white"
          value={form[field]}
          onChange={(event) => updateField(field, event.target.value)}
          autoComplete={field === "currentPassword" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-stone-900"
          onClick={() => toggleVisibility(field)}
          aria-label={visible[field] ? "Hide password" : "Show password"}
        >
          {visible[field] ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </label>
  );

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:ml-8 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">Settings</h1>

        <form
          onSubmit={submitPasswordChange}
          className="w-full max-w-xl rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-y-4 p-7">
            <PasswordInput field="currentPassword" label="Current password" />
            <PasswordInput field="newPassword" label="New password" />
            <div className="flex items-center gap-x-2 text-sm text-gray-500">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                  hasMinimumLength
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-gray-400 text-gray-500"
                }`}
              >
                {hasMinimumLength ? <FaCheck /> : <FaXmark />}
              </span>
              <span>8 or more characters</span>
            </div>
            <PasswordInput field="confirmPassword" label="Verify password" />
            {form.confirmPassword.length > 0 && (
              <div className="flex items-center gap-x-2 text-sm text-gray-500">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                    passwordsMatch
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-gray-400 text-gray-500"
                  }`}
                >
                  {passwordsMatch ? <FaCheck /> : <FaXmark />}
                </span>
                <span>Passwords match</span>
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-gray-200 p-7">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-stone-900 px-7 py-3 font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? "Changing..." : "Change"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
