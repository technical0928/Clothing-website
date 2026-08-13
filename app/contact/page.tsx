"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaInstagram,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";
import apiClient from "@/lib/api";

const CONTACT_INFO = [
  {
    icon: FaPhone,
    label: "Call us",
    value: "+92 301 7795702",
    href: "tel:+923017795702",
  },
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    value: "+92 301 7795702",
    href: "https://wa.me/923017795702",
  },
  {
    icon: FaEnvelope,
    label: "Email us",
    value: "technicalsothikhan0928@gmail.com",
    href: "mailto:technicalsothikhan0928@gmail.com",
  },
  {
    icon: FaInstagram,
    label: "Instagram",
    value: "@noor-e-multan",
    href: "https://instagram.com/noor-e-multan",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (form.message.trim().length < 10) {
      toast.error("Your message should be at least 10 characters");
      return;
    }

    setSending(true);
    try {
      const res = await apiClient.post("/api/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Something went wrong. Please try again.");
        return;
      }
      toast.success(data.message || "Your message has been sent!");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="bg-[#f4f3ee]">
      <section className="mx-auto max-w-screen-2xl px-6 py-20 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Left — contact details */}
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-700">
              Contact us
            </p>
            <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-stone-900 max-md:text-4xl">
              Let&apos;s talk about your next order
            </h1>
            <p className="mt-6 max-w-md leading-7 text-stone-600">
              Questions about sizing, fabric, an existing order, or a custom
              piece? Message Noor-e-Multan — we reply with clear next steps.
            </p>

            <ul className="mt-12 space-y-8">
              {CONTACT_INFO.map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-700/10 text-amber-700">
                    <item.icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                      {item.label}
                    </p>
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                      className="mt-1 block break-all text-lg font-medium leading-snug text-stone-900 hover:text-amber-700"
                    >
                      {item.value}
                    </a>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-12 rounded-lg border border-stone-200 bg-white p-6">
              <div className="flex items-start gap-4">
                <FaMapMarkerAlt size={18} className="mt-1 text-amber-700" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                    Service area
                  </p>
                  <p className="mt-1 leading-7 text-stone-700">
                    Delivery all over Pakistan — orders prepared and dispatched
                    from Multan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — message form */}
          <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm lg:p-10">
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              Send us a message
            </h2>
            <p className="mt-2 text-stone-600">
              Fill in the form and your message goes straight to our team.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-stone-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="mt-2 w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-stone-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="mt-2 w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-stone-700"
                >
                  How can we help?
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Tell us about your order, sizing question, or feedback..."
                  className="mt-2 w-full resize-y rounded-md border border-stone-300 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-stone-900 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane size={14} />
                    Send message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
