"use client";

// *********************
// Role of the component: Newsletter signup — collects an email address and
// sends it to the /api/newsletter endpoint. Shows success/error feedback
// via toast so the customer knows the subscription actually went through.
// Name of the component: Newsletter.tsx
// *********************

import React, { useState } from "react";
import toast from "react-hot-toast";
import apiClient from "@/lib/api";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();

    if (!value) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/api/newsletter", { email: value });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Subscribed successfully!");
        setEmail("");
      } else {
        toast.error(data.error || data.message || "Subscription failed. Please try again.");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white py-5 sm:py-24 lg:py-20">
      <div className="mx-auto grid justify-items-center max-w-screen-2xl grid-cols-1 gap-10 px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="max-w-xl text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:col-span-7">
          <h2 className="inline sm:block lg:inline xl:block max-sm:text-xl">Want product news and updates?</h2>{" "}
          <p className="inline sm:block lg:inline xl:block max-sm:text-xl">Sign up for our newsletter.</p>
        </div>
        <form className="w-full max-w-md lg:col-span-5 lg:pt-2" onSubmit={handleSubmit}>
          <div className="flex gap-x-4">
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6 disabled:bg-gray-100"
              placeholder="Enter your email"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-none rounded-md bg-custom-yellow px-3.5 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-black hover:text-custom-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-gray-900">
            We care about your data. Read our{" "}
            <a href="#" className="font-semibold hover:text-custom-yellow text-black">
              privacy&nbsp;policy
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;
