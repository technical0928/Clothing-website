"use client";
import { SectionTitle } from "@/components";
import { Loader } from "@/components/Loader";
import apiClient from "@/lib/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa6";

const emptyProfile = {
  name: "",
  lastname: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  postalCode: "",
};

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const sessionUser = (session as any)?.user as
    | { id?: string; email?: string; role?: string }
    | undefined;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ ...emptyProfile });
  const [passwordForm, setPasswordForm] = useState({ ...emptyPasswordForm });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !sessionUser?.id) {
      setLoading(false);
      return;
    }
    apiClient
      .get(`/api/users/${sessionUser.id}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load profile");
        }
        const user = await res.json();
        setProfile({
          name: user.name || "",
          lastname: user.lastname || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          country: user.country || "",
          postalCode: user.postalCode || "",
        });
      })
      .catch(() => toast.error("Could not load your profile. Please try again later."))
      .finally(() => setLoading(false));
  }, [status, sessionUser?.id]);

  const saveProfile = async () => {
    if (!sessionUser?.id) return;
    setSaving(true);
    try {
      const response = await apiClient.put(`/api/users/${sessionUser.id}`, profile);
      if (response.ok) {
        toast.success("Profile updated successfully");
        router.refresh();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and verify password do not match");
      return;
    }
    setChangingPassword(true);
    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to change password");
        return;
      }
      toast.success(data.message || "Password changed successfully");
      setPasswordForm({ ...emptyPasswordForm });
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="bg-white">
        <SectionTitle title="My Profile" path="Home | Profile" />
        <Loader />
      </div>
    );
  }

  if (status !== "authenticated" || !sessionUser?.id) {
    return (
      <div className="bg-white">
        <SectionTitle title="My Profile" path="Home | Profile" />
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-y-6 px-4 pb-24 pt-16 text-center">
          <FaUser className="h-16 w-16 text-stone-300" />
          <h1 className="text-2xl font-bold text-gray-900">Please log in to view your profile</h1>
          <Link
            href="/login"
            className="inline-flex items-center gap-x-2 bg-stone-900 px-8 py-3 font-bold uppercase text-white hover:bg-stone-800"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const updateProfile = (field: keyof typeof emptyProfile, value: string) =>
    setProfile((current) => ({ ...current, [field]: value }));

  const updatePassword = (field: keyof typeof emptyPasswordForm, value: string) =>
    setPasswordForm((current) => ({ ...current, [field]: value }));

  const inputClass =
    "block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm";

  return (
    <div className="bg-white">
      <SectionTitle title="My Profile" path="Home | Profile" />
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-y-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">My Profile</h1>
            <p className="mt-2 text-sm text-stone-600">
              Signed in as <strong>{sessionUser?.email}</strong> ·{" "}
              <span className="capitalize">{sessionUser?.role || "user"}</span>
            </p>
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-x-2 border border-stone-300 bg-white px-5 py-2.5 text-sm font-bold uppercase text-stone-900 hover:bg-stone-900 hover:text-white"
          >
            My Orders
          </Link>
        </div>

        {/* Account details */}
        <section className="mt-10 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Account details</h2>
            <p className="mt-1 text-sm text-stone-500">
              Update your personal information. Your email is used for login and order confirmations.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                id="profile-name"
                type="text"
                className={`${inputClass} mt-1`}
                value={profile.name}
                onChange={(e) => updateProfile("name", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="profile-lastname" className="block text-sm font-medium text-gray-700">Lastname</label>
              <input
                id="profile-lastname"
                type="text"
                className={`${inputClass} mt-1`}
                value={profile.lastname}
                onChange={(e) => updateProfile("lastname", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700">Phone number</label>
              <input
                id="profile-phone"
                type="tel"
                className={`${inputClass} mt-1`}
                value={profile.phone}
                onChange={(e) => updateProfile("phone", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="profile-address" className="block text-sm font-medium text-gray-700">Address</label>
              <input
                id="profile-address"
                type="text"
                className={`${inputClass} mt-1`}
                value={profile.address}
                onChange={(e) => updateProfile("address", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="profile-city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                id="profile-city"
                type="text"
                className={`${inputClass} mt-1`}
                value={profile.city}
                onChange={(e) => updateProfile("city", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="profile-country" className="block text-sm font-medium text-gray-700">Country</label>
              <input
                id="profile-country"
                type="text"
                className={`${inputClass} mt-1`}
                value={profile.country}
                onChange={(e) => updateProfile("country", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="profile-postal" className="block text-sm font-medium text-gray-700">Postal code</label>
              <input
                id="profile-postal"
                type="text"
                className={`${inputClass} mt-1`}
                value={profile.postalCode}
                onChange={(e) => updateProfile("postalCode", e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end border-t border-gray-200 p-6">
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="rounded-md bg-stone-900 px-7 py-3 font-bold uppercase text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </section>

        {/* Password change */}
        <section className="mt-10 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
            <p className="mt-1 text-sm text-stone-500">Use at least 8 characters for your new password.</p>
          </div>
          <form onSubmit={changePassword} className="grid grid-cols-1 gap-x-6 gap-y-5 p-6 sm:grid-cols-2">
            <div>
              <label htmlFor="pw-current" className="block text-sm font-medium text-gray-700">Current password</label>
              <div className="relative mt-1">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="pw-current"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`${inputClass} pl-9 pr-10`}
                  value={passwordForm.currentPassword}
                  onChange={(e) => updatePassword("currentPassword", e.target.value)}
                />
              </div>
            </div>
            <div className="sm:col-span-2 sm:flex sm:items-end sm:justify-end">
              <label className="flex cursor-pointer items-center gap-x-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword((visible) => !visible)}
                  className="checkbox checkbox-sm"
                />
                {showPassword ? <FaEye /> : <FaEyeSlash />}
                Show passwords
              </label>
            </div>
            <div>
              <label htmlFor="pw-new" className="block text-sm font-medium text-gray-700">New password</label>
              <div className="relative mt-1">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="pw-new"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`${inputClass} pl-9`}
                  value={passwordForm.newPassword}
                  onChange={(e) => updatePassword("newPassword", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="pw-confirm" className="block text-sm font-medium text-gray-700">Verify new password</label>
              <div className="relative mt-1">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="pw-confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`${inputClass} pl-9`}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => updatePassword("confirmPassword", e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end sm:col-span-2">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-md border border-stone-300 bg-white px-7 py-3 font-bold uppercase text-stone-900 hover:bg-stone-900 hover:text-white disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {changingPassword ? "Changing..." : "Change password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
