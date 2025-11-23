"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

// Handles both:
// 1) Proxy-style Lambda response: { statusCode, body: "json-string" }
// 2) Normal JSON response:        { message: "...", ... }
async function parseApiResponse(res: Response) {
  const raw = await res.json().catch(() => ({} as any));

  // If it looks like a normal JSON (no statusCode), treat it as such
  if (!raw || typeof raw.statusCode === "undefined") {
    return {
      httpStatus: res.status,
      statusCode: res.status,
      payload: raw,
    };
  }

  // Lambda proxy style
  let inner: any = raw;
  if (raw && typeof raw.body === "string") {
    try {
      inner = JSON.parse(raw.body);
    } catch {
      inner = {};
    }
  }

  return {
    httpStatus: res.status,
    statusCode:
      typeof raw.statusCode === "number" ? raw.statusCode : res.status,
    payload: inner,
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-fill from URL query: /reset-password?email=...&token=...
  const emailFromQuery = searchParams.get("email") || "";
  const tokenFromQuery = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromQuery);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!token) {
      setError("Reset token is required.");
      return false;
    }
    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, and 1 special character."
      );
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/applicants/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // IMPORTANT: match Lambda contract exactly
          body: JSON.stringify({ token, newPassword, confirmPassword }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);

      if (statusCode >= 400) {
        setError(payload?.message || "Password reset failed.");
        return;
      }

      setMessage(
        payload?.message || "Password reset successful! Redirecting..."
      );
      setTimeout(() => router.push("/applicant/login"), 1200);
    } catch (err) {
      console.error(err);
      setError("Network error: could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 18px 40px rgba(15,23,42,0.15)",
          padding: "2.5rem 3rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Reset Password
        </h1>

        {emailFromQuery && (
          <p
            style={{
              color: "#4b5563",
              fontSize: "0.95rem",
              marginBottom: "0.75rem",
            }}
          >
            Resetting password for{" "}
            <span style={{ fontWeight: 600 }}>{emailFromQuery}</span>
          </p>
        )}

        <p
          style={{
            color: "#6b7280",
            fontSize: "0.95rem",
            marginBottom: "1.5rem",
          }}
        >
          Your reset token is prefilled when you come from the login page.
          Just choose a new password and confirm it.
        </p>

        <form onSubmit={handleReset}>
          {/* Reset token */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 500,
                fontSize: "0.95rem",
                marginBottom: "0.35rem",
              }}
            >
              Reset Token
            </label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "9999px",
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
              }}
            />
          </div>

          {/* New password */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 500,
                fontSize: "0.95rem",
                marginBottom: "0.35rem",
              }}
            >
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "9999px",
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
              }}
            />
          </div>

          {/* Confirm password */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 500,
                fontSize: "0.95rem",
                marginBottom: "0.35rem",
              }}
            >
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "9999px",
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
              }}
            />
          </div>

          <p
            style={{
              fontSize: "0.8rem",
              color: "#9ca3af",
              marginBottom: "0.75rem",
            }}
          >
            Password must be at least 8 characters and include 1 uppercase, 1
            lowercase, and 1 special character.
          </p>

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
          {message && (
            <p
              style={{
                color: "#166534",
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.9rem 1rem",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}