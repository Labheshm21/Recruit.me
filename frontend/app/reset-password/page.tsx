/*"use client";

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function parseLambdaResponse(outer: any, res: Response) {
  const statusCode =
    typeof outer?.statusCode === "number" ? outer.statusCode : res.status;

  let payload: any = {};

  if (typeof outer?.body === "string") {
    try {
      payload = JSON.parse(outer.body);
    } catch {
      payload = {};
    }
  } else if (outer?.body) {
    payload = outer.body;
  } else {
    payload = outer;
  }

  return { statusCode, payload };
}

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !resetToken || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match.");
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, and 1 special character."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/applicants/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            resetToken,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to reset password.");
        return;
      }

      setInfo(
        payload?.message || "Password reset successful. You can now log in."
      );
    } catch (err) {
      console.error("reset password error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="card">
        <h1 className="card-title">Reset Password</h1>
        <p className="card-subtitle">
          Paste the reset token you received, then choose a new password.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Reset Token</label>
            <input
              type="text"
              className="input"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label className="label">New Password</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p
              style={{
                color: "#b91c1c",
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </p>
          )}

          {info && (
            <p
              style={{
                color: "#166534",
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
              }}
            >
              {info}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Resetting password…" : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

*/
import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading reset form…</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}