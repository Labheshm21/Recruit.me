
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const emailIsValid = emailRegex.test(email);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!emailIsValid) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/applicants/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);

      if (statusCode >= 400) {
        setError(payload?.message || "Login failed.");
        return;
      }

      if (typeof window !== "undefined") {
        if (payload?.token) {
          localStorage.setItem("token", payload.token);
        }
        localStorage.setItem("email", email);
      }
      setMessage("Login successful. Redirecting...");
      setTimeout(() => {
        router.push("/applicant/home");
      }, 1000);

    } catch (err) {
      console.error(err);
      setError("Network error: could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setMessage(null);

    if (!emailIsValid) {
      setError("Enter a valid email before requesting password reset.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/applicants/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);

      if (statusCode >= 400) {
        setError(payload?.message || "Unable to send reset request.");
        return;
      }

      const resetToken: string = payload?.token || "";

      setMessage(
        payload?.message ||
          "If an account exists for this email, a reset link has been generated."
      );

      setTimeout(() => {
        let url = `/reset-password?email=${encodeURIComponent(email)}`;
        if (resetToken) {
          url += `&token=${encodeURIComponent(resetToken)}`;
        }
        router.push(url);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Network error: could not reach the server.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Applicant Login</h1>
      <form onSubmit={handleLogin}>
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
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleForgotPassword}
        disabled={!emailIsValid || forgotLoading}
        style={{ marginTop: "1rem" }}
      >
        {forgotLoading ? "Sending reset..." : "Forgot Password"}
      </button>
    </div>
  );
}
