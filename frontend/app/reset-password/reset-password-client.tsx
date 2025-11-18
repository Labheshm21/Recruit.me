"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

// Helper to unwrap API Gateway response
async function parseApiResponse(res: Response) {
  const raw = await res.json().catch(() => ({} as any));

  if (raw && typeof raw.statusCode === "undefined") {
    return {
      httpStatus: res.status,
      statusCode: res.status,
      payload: raw,
    };
  }

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
    statusCode: typeof raw.statusCode === "number" ? raw.statusCode : res.status,
    payload: inner,
  };
}

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/applicants/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword, confirmPassword }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);

      if (statusCode >= 400) {
        setError(payload?.message || "Password reset failed.");
        return;
      }

      setMessage(payload?.message || "Password reset successful! Redirecting...");
      setTimeout(() => router.push("/applicant/login"), 1200);
    } catch (err) {
      console.error(err);
      setError("Network error: could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Reset Password</h1>

      {emailFromQuery && (
        <p>Resetting password for <b>{emailFromQuery}</b></p>
      )}

      <form onSubmit={handleReset}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Reset Token</label><br />
          <input
            value={token}
            onChange={e => setToken(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>New Password</label><br />
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Confirm Password</label><br />
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}

        <button disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
