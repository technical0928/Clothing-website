"use client";

import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import config from "@/lib/config";
import { isValidEmailAddressFormat } from "@/lib/utils";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser, FaXmark } from "react-icons/fa6";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

const emptyForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

// Module-level component: keeps a stable identity so React does not remount
// the inputs on every keystroke (which used to drop focus after each
// character and made the fields feel disabled).
function PasswordInput({
  field,
  label,
  value,
  visible,
  onValueChange,
  onToggleVisible,
}: {
  field: PasswordField;
  label: string;
  value: string;
  visible: boolean;
  onValueChange: (value: string) => void;
  onToggleVisible: () => void;
}) {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text text-base font-semibold text-stone-900">{label}</span>
      </div>
      <div className="relative">
        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type={visible ? "text" : "password"}
          name={field}
          className="input input-bordered w-full pl-11 pr-12 bg-white"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          autoComplete={field === "currentPassword" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-stone-900"
          onClick={onToggleVisible}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </label>
  );
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState(emptyForm);
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { data: session, update } = useSession();
  const sessionUser = (session as any)?.user as
    | { id?: string; email?: string; image?: string }
    | undefined;
  const [profileImage, setProfileImage] = useState<string>(
    (session as any)?.user?.image || ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account details (email change) state
  const [accountEmail, setAccountEmail] = useState(
    (session as any)?.user?.email || ""
  );
  const [accountName, setAccountName] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  // Email (SMTP) settings state
  const [smtp, setSmtp] = useState({
    host: "",
    port: "587",
    user: "",
    pass: "",
    from: "",
  });
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    apiClient
      .get(`/api/settings/email`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setSmtpConfigured(Boolean(data.configured));
        setSmtp({
          host: data.host || "",
          port: String(data.port || 587),
          user: data.user || "",
          pass: "",
          from: data.from || "",
        });
      })
      .catch(() => undefined);
  }, []);

  const saveEmailSettings = async () => {
    setSavingEmail(true);
    try {
      const response = await apiClient.post("/api/settings/email", {
        host: smtp.host,
        port: smtp.port,
        user: smtp.user,
        pass: smtp.pass,
        from: smtp.from,
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to save email settings");
        return;
      }
      setSmtpConfigured(Boolean(data.configured));
      setSmtp((current) => ({ ...current, pass: "" }));
      toast.success(data.message || "Email settings saved");
    } catch (error) {
      console.error("Save email settings failed:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setSavingEmail(false);
    }
  };

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

  const uploadPhoto = async (file: File) => {
    if (!sessionUser?.id) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("uploadedFile", file);
      const response = await fetch(`${config.apiBaseUrl}/api/main-image`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const data = await response.json();
      if (!data?.fileName) {
        throw new Error("No file name returned");
      }
      const savedPath = data.fileName as string;
      const updateResponse = await apiClient.put(`/api/users/${sessionUser.id}`, {
        image: savedPath,
      });
      if (!updateResponse.ok) {
        throw new Error("Failed to save profile photo");
      }
      setProfileImage(savedPath);
      update({ image: savedPath });
      toast.success("Profile photo updated");
    } catch (error) {
      console.error("Photo upload failed:", error);
      toast.error("Photo upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
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

  const submitAccountUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!sessionUser?.id) return;

    if (!accountPassword) {
      toast.error("Enter your current password to confirm changes");
      return;
    }

    if (!isValidEmailAddressFormat(accountEmail)) {
      toast.error("Email address is invalid");
      return;
    }

    setSavingAccount(true);
    try {
      const response = await fetch("/api/admin/update-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: accountEmail,
          name: accountName,
          currentPassword: accountPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to update account");
        return;
      }
      toast.success(data.message || "Account updated successfully");
      setAccountPassword("");
      setAccountName("");
      update({ email: accountEmail });
    } catch (error) {
      console.error("Account update failed:", error);
      toast.error("Failed to update account");
    } finally {
      setSavingAccount(false);
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto xl:h-full max-xl:flex-col max-xl:gap-y-5">
      <DashboardSidebar />
      <div className="flex flex-col gap-y-7 xl:ml-8 max-xl:px-5 w-full">
        <h1 className="text-3xl font-semibold">Settings</h1>

        {/* Profile photo */}
        <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-y-5 p-7">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Profile photo</h2>
              <p className="mt-1 text-sm text-stone-500">
                Shown next to your name in the dashboard header.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-amber-600 bg-stone-100">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/${profileImage}`}
                    alt="Profile photo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaUser className="h-9 w-9 text-stone-400" />
                )}
              </div>
              <div className="flex flex-col items-start gap-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={uploadingPhoto}
                  className="block w-full max-w-xs text-sm text-stone-600 file:mr-4 file:rounded-md file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-bold file:uppercase file:text-white hover:file:bg-stone-800"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadPhoto(file);
                    e.target.value = "";
                  }}
                />
                {uploadingPhoto && <span className="text-sm text-stone-500">Uploading...</span>}
                {profileImage && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!sessionUser?.id) return;
                      const response = await apiClient.put(`/api/users/${sessionUser.id}`, {
                        image: null,
                      });
                      if (response.ok) {
                        setProfileImage("");
                        update({ image: null });
                        toast.success("Profile photo removed");
                      } else {
                        toast.error("Failed to remove photo");
                      }
                    }}
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account details — email / name change */}
        <form
          onSubmit={submitAccountUpdate}
          className="w-full max-w-xl rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 p-7">
            <h2 className="text-lg font-semibold text-stone-900">Account details</h2>
            <p className="mt-1 text-sm text-stone-500">
              Update your email address and display name. Enter your current
              password to confirm. You will need to log in with the new email
              next time.
            </p>
          </div>
          <div className="flex flex-col gap-y-4 p-7">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-base font-semibold text-stone-900">Email address</span>
              </div>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  className="input input-bordered w-full pl-11 bg-white"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                />
              </div>
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-base font-semibold text-stone-900">Name (optional)</span>
              </div>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  className="input input-bordered w-full pl-11 bg-white"
                  placeholder="Your display name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-base font-semibold text-stone-900">Current password</span>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="current-password"
                  className="input input-bordered w-full pl-11 pr-12 bg-white"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                />
              </div>
            </label>
          </div>
          <div className="flex justify-end border-t border-gray-200 p-7">
            <button
              type="submit"
              disabled={savingAccount}
              className="rounded-md bg-stone-900 px-7 py-3 font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {savingAccount ? "Saving..." : "Update account"}
            </button>
          </div>
        </form>

        {/* Email (SMTP) settings */}
        <div className="w-full max-w-xl rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-7">
            <div className="flex items-center justify-between gap-x-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">Email (SMTP) settings</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Used for order confirmations, status updates and password reset
                  emails. Without SMTP, emails are logged to the server console only.
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  smtpConfigured
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {smtpConfigured ? "Active" : "Console mode"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-4 p-7 sm:grid-cols-2">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-base font-semibold text-stone-900">SMTP host</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full bg-white"
                placeholder="smtp.gmail.com"
                value={smtp.host}
                onChange={(e) => setSmtp((current) => ({ ...current, host: e.target.value }))}
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-base font-semibold text-stone-900">SMTP port</span>
              </div>
              <input
                type="number"
                className="input input-bordered w-full bg-white"
                placeholder="587"
                value={smtp.port}
                onChange={(e) => setSmtp((current) => ({ ...current, port: e.target.value }))}
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-base font-semibold text-stone-900">SMTP user (email)</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full bg-white"
                placeholder="you@gmail.com"
                value={smtp.user}
                onChange={(e) => setSmtp((current) => ({ ...current, user: e.target.value }))}
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-base font-semibold text-stone-900">SMTP password / app password</span>
              </div>
              <input
                type="password"
                className="input input-bordered w-full bg-white"
                placeholder={smtpConfigured ? "•••••••• (saved — leave blank to keep)" : "Password"}
                value={smtp.pass}
                onChange={(e) => setSmtp((current) => ({ ...current, pass: e.target.value }))}
              />
            </label>
            <label className="form-control w-full sm:col-span-2">
              <div className="label">
                <span className="label-text text-base font-semibold text-stone-900">From (sender name & email)</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full bg-white"
                placeholder="Noor-e-Multan <no-reply@noor-e-multan.com>"
                value={smtp.from}
                onChange={(e) => setSmtp((current) => ({ ...current, from: e.target.value }))}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-3 border-t border-gray-200 p-7">
            <button
              type="button"
              disabled={savingEmail}
              onClick={saveEmailSettings}
              className="rounded-md bg-stone-900 px-7 py-3 font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {savingEmail ? "Saving..." : "Save email settings"}
            </button>
          </div>
        </div>

        {/* Change password */}
        <form
          onSubmit={submitPasswordChange}
          className="w-full max-w-xl rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 p-7">
            <h2 className="text-lg font-semibold text-stone-900">Change password</h2>
            <p className="mt-1 text-sm text-stone-500">
              Use at least 8 characters for your new password.
            </p>
          </div>
          <div className="flex flex-col gap-y-4 p-7">
            <PasswordInput
              field="currentPassword"
              label="Current password"
              value={form.currentPassword}
              visible={visible.currentPassword}
              onValueChange={(value) => updateField("currentPassword", value)}
              onToggleVisible={() => toggleVisibility("currentPassword")}
            />
            <PasswordInput
              field="newPassword"
              label="New password"
              value={form.newPassword}
              visible={visible.newPassword}
              onValueChange={(value) => updateField("newPassword", value)}
              onToggleVisible={() => toggleVisibility("newPassword")}
            />
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
            <PasswordInput
              field="confirmPassword"
              label="Verify password"
              value={form.confirmPassword}
              visible={visible.confirmPassword}
              onValueChange={(value) => updateField("confirmPassword", value)}
              onToggleVisible={() => toggleVisibility("confirmPassword")}
            />
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
