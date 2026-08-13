"use client";
import { CustomButton, DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import { nanoid } from "nanoid";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const DashboardUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // sending API request for all users
    apiClient.get("/api/users")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setUsers(data);
      });
  }, []);

  const toggleRole = async (user: User) => {
    const nextRole = user.role === "admin" ? "user" : "admin";
    try {
      const response = await apiClient.put(`/api/users/${user.id}`, {
        role: nextRole,
      });
      if (response.status === 200) {
        await response.json();
        if (nextRole === "admin") {
          toast.success("User promoted to admin — password reset codes now work for this email");
        } else {
          toast.success("Admin removed — password reset codes disabled for this account");
        }
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Could not change role");
      }
    } catch (error) {
      console.error("Role update failed:", error);
      toast.error("Could not change role");
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto h-full max-xl:flex-col max-xl:h-fit max-xl:gap-y-4">
      <DashboardSidebar />
      <div className="w-full">
        <h1 className="text-3xl font-semibold text-center mb-5">All users</h1>
        <div className="flex justify-end mb-5">
          <Link href="/admin/users/new">
            <CustomButton
              buttonType="button"
              customWidth="110px"
              paddingX={10}
              paddingY={5}
              textSize="base"
              text="Add new user"
            />
          </Link>
        </div>
        <div className="xl:ml-5 w-full max-xl:mt-5 overflow-auto w-full h-[80vh]">
          <table className="table table-md table-pin-cols">
            {/* head */}
            <thead>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </th>
                <th>Email</th>
                <th>Role</th>
                <th>Password reset codes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              {users &&
                users.map((user) => (
                  <tr key={nanoid()}>
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </th>

                    <td>
                      <div className="flex items-center gap-3">
                        <p>{user?.email}</p>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user?.role === "admin"
                            ? "badge-amber"
                            : "badge-ghost"
                        }`}
                      >
                        {user?.role}
                      </span>
                    </td>
                    <td>
                      {user?.role === "admin" ? (
                        <span className="text-xs text-green-600 font-semibold">
                          Enabled — OTP goes to this email
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Disabled — no OTP for this account
                        </span>
                      )}
                    </td>
                    <th>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/users/${user?.id}`}
                          className="btn btn-ghost btn-xs"
                        >
                          details
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleRole(user)}
                          className={`btn btn-xs ${
                            user?.role === "admin"
                              ? "btn-error btn-outline"
                              : "bg-amber-600 text-white border-amber-600 hover:bg-amber-700"
                          }`}
                        >
                          {user?.role === "admin"
                            ? "Remove admin"
                            : "Make admin"}
                        </button>
                      </div>
                    </th>
                  </tr>
                ))}
            </tbody>
            {/* foot */}
            <tfoot>
              <tr>
                <th></th>
                <th>Email</th>
                <th>Role</th>
                <th>Password reset codes</th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardUsers;
