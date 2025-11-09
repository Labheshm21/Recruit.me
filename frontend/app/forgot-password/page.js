"use client";

import { useState } from "react";
import Link from "next/link";

import { apiFetch } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setMessage("If the email exists, a verification code has been sent.");
      setStep(2);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Unable to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!confirmationCode.trim() || !newPassword.trim()) {
      setError("Please enter the verification code and a new password.");
      setLoading(false);
      return;
    }

    try {
      await apiFetch("/auth/forgot-password/confirm", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          code: confirmationCode.trim(),
          new_password: newPassword,
        }),
      });
      setMessage("Password reset successfully. You can now log in with your new password.");
      setStep(3);
    } catch (err) {
      console.error("Confirm reset error:", err);
      setError(err.message || "Unable to reset password. Please verify the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto text-center">
            <div className="text-3xl font-bold text-black">RECRUIT.ME</div>
            <div className="text-sm text-gray-600 mt-1">Job Portal</div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 ? "Reset Your Password" : step === 2 ? "Enter Verification Code" : "All set"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 1
              ? "Enter your email address to receive a verification code."
              : step === 2
              ? "Check your inbox for the verification code and choose a new password."
              : "Your password has been updated successfully."}
          </p>
        </div>

        {message && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{message}</div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleRequestReset}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleConfirmReset}>
            <div className="space-y-4">
              <div>
                <label htmlFor="code" className="sr-only">
                  Verification code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="Verification code"
                  value={confirmationCode}
                  onChange={(event) => setConfirmationCode(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="new-password" className="sr-only">
                  New password
                </label>
                <input
                  id="new-password"
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              You can now log in using your updated credentials.
            </p>
            <Link href="/login" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm">
              Back to Login
            </Link>
          </div>
        )}

        {step !== 3 && (
          <div className="text-center">
            <Link href="/login" className="font-medium text-black hover:text-gray-700">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
