"use client";

import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaReply,
  FaTrash,
} from "react-icons/fa6";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DashboardMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const query =
        filter === "all" ? "" : `?read=${filter === "unread" ? "false" : "true"}`;
      const res = await apiClient.get(`/api/contact${query}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not load messages");
        return;
      }
      setMessages(data.messages || []);
      setUnreadCount(data.unreadCount || 0);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error("Failed to fetch contact messages:", error);
      toast.error("Could not load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const toggleRead = async (message: ContactMessage) => {
    try {
      const res = await apiClient.patch(`/api/contact/${message.id}`, {
        isRead: !message.isRead,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Could not update message");
        return;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id ? { ...m, isRead: !message.isRead } : m
        )
      );
      setUnreadCount((count) =>
        message.isRead ? count + 1 : Math.max(0, count - 1)
      );
    } catch (error) {
      console.error("Update message failed:", error);
      toast.error("Could not update message");
    }
  };

  const removeMessage = async (id: string) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    try {
      const res = await apiClient.delete(`/api/contact/${id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Could not delete message");
        return;
      }
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setTotalCount((count) => Math.max(0, count - 1));
      toast.success("Message deleted");
    } catch (error) {
      console.error("Delete message failed:", error);
      toast.error("Could not delete message");
    }
  };

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto h-full max-xl:flex-col max-xl:h-fit max-xl:gap-y-4">
      <DashboardSidebar />
      <div className="w-full">
        <h1 className="text-3xl font-semibold text-center mb-2">
          Contact messages
        </h1>
        <p className="text-center text-sm text-stone-500 mb-5">
          {unreadCount} unread of {totalCount} total — messages from the website
          contact form
        </p>

        {/* Filter tabs */}
        <div className="flex justify-center gap-x-2 mb-6">
          {(["all", "unread", "read"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                filter === option
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {option === "all"
                ? `All (${totalCount})`
                : option === "unread"
                  ? `Unread (${unreadCount})`
                  : "Read"}
            </button>
          ))}
        </div>

        <div className="xl:ml-5 w-full max-xl:mt-5 overflow-auto h-[70vh]">
          {loading ? (
            <p className="text-center text-stone-500 py-10">Loading...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <FaEnvelopeOpen className="mx-auto text-5xl text-stone-300" />
              <p className="mt-4 text-stone-500">
                {filter === "all"
                  ? "No messages yet."
                  : filter === "unread"
                    ? "No unread messages. All caught up!"
                    : "No read messages."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-y-4 px-4 pb-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg border p-5 ${
                    message.isRead
                      ? "border-stone-200 bg-stone-50"
                      : "border-amber-300 bg-amber-50"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="flex items-center gap-x-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          message.isRead
                            ? "bg-stone-200 text-stone-500"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        <FaEnvelope size={16} />
                      </span>
                      <div>
                        <p className="font-semibold text-stone-900">
                          {message.name}
                          {!message.isRead && (
                            <span className="ml-2 rounded-full bg-amber-600 px-2 py-0.5 text-xs font-bold uppercase text-white">
                              New
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-stone-500">{message.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <span className="text-xs text-stone-400">
                        {formatDate(message.createdAt)}
                      </span>
                      <a
                        href={`mailto:${message.email}?subject=Re: Your message to Noor-e-Multan`}
                        className="btn btn-ghost btn-xs"
                        title="Reply by email"
                      >
                        <FaReply />
                        Reply
                      </a>
                      <button
                        type="button"
                        onClick={() => toggleRead(message)}
                        className={`btn btn-xs ${
                          message.isRead
                            ? "btn-ghost"
                            : "bg-amber-600 text-white border-amber-600 hover:bg-amber-700"
                        }`}
                        title={message.isRead ? "Mark as unread" : "Mark as read"}
                      >
                        {message.isRead ? "Mark unread" : "Mark read"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMessage(message.id)}
                        className="btn btn-error btn-outline btn-xs"
                        title="Delete message"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap leading-7 text-stone-700">
                    {message.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardMessages;
