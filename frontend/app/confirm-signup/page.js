"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";


export default function ConfirmSignupPage() {
  const sp = useSearchParams();
  const router = useRouter();

  // prefill email from query string if present
  const [email, setEmail] = useState(sp.get("email") ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    if (!email || !code) {
      setMsg("Please enter both email and the verification code.");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await apiFetch("/auth/confirm-signup", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      setMsg("Account confirmed! Redirecting to login…");
      setTimeout(() => router.replace("/login"), 800);
    } catch (err) {
      setMsg(err?.message || "Failed to confirm. Double-check the code.");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (!email) {
      setMsg("Enter your email first, then click Resend.");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await apiFetch("/auth/resend-confirmation", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMsg("Verification code resent. Check your inbox.");
    } catch (err) {
      setMsg(err?.message || "Could not resend the code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Confirm your account</h1>
          <p className="text-sm text-gray-600 mt-2">
            We sent a 6-digit verification code to your email.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              className="w-full border p-2 rounded"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="code" className="sr-only">Verification code</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full border p-2 rounded tracking-widest"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
          >
            {loading ? "Confirming…" : "Confirm"}
          </button>

          <button
            type="button"
            onClick={onResend}
            disabled={loading}
            className="w-full border py-2 rounded"
          >
            {loading ? "Resending…" : "Resend code"}
          </button>

          {msg && <p className="text-sm text-center mt-2">{msg}</p>}
        </form>

        <p className="text-center text-sm text-gray-600">
          Already confirmed?{" "}
          <a href="/login" className="underline">Go to login</a>
        </p>
      </div>
    </div>
  );
}
