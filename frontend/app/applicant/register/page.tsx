"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

// Helper to handle both:
// 1) Proper proxy-style responses: { message: "...", ... }
// 2) Wrapped API Gateway responses: { statusCode, body: "{\"message\":\"...\"}", ... }
async function parseApiResponse(res: Response) {
  const raw = await res.json().catch(() => ({} as any));

  // Case 1: proxy-style (no statusCode in body)
  if (raw && typeof raw.statusCode === "undefined") {
    return {
      httpStatus: res.status,
      statusCode: res.status,
      payload: raw,
    };
  }

  // Case 2: wrapped style from non-proxy integration
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

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateInputs = (): boolean => {
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, and 1 special character."
      );
      return false;
    }
    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Client-side validation first
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/applicants/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, confirmPassword }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);

      // IMPORTANT: use statusCode from body, not just res.ok,
      // because API Gateway may always return HTTP 200
      if (statusCode >= 400) {
        setError(payload?.message || "Signup failed.");
        return; // do NOT redirect
      }

      // Success case
      setMessage(
        payload?.message || "Registration successful. Redirecting to login..."
      );
      setTimeout(() => {
        router.push("/applicant/login");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Network error: could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Applicant Signup</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
          <small>
            Must be ≥ 8 characters, with 1 uppercase, 1 lowercase, and 1 special
            character.
          </small>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Confirm Password</label>
          <br />
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

        <button type="submit" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      {/* Existing user login link */}
      <div style={{ marginTop: "1.5rem" }}>
        <span>Already registered? </span>
        <Link href="/applicant/login" style={{ textDecoration: "underline" }}>
          Login here
        </Link>
      </div>
    </div>
  );
}
