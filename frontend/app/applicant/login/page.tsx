/*"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function ApplicantLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/applicants/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode === 200) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", payload?.token || "");
          localStorage.setItem("email", email);
        }
        router.push("/applicant/home");
        return;
      }

      if (statusCode === 401) {
        setError(payload?.message || "Incorrect credentials. Please try again.");
      } else {
        setError(payload?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setInfo("");

    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/applicants/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to initiate password reset.");
        return;
      }

      setInfo(
        payload?.message ||
          "If an account exists, a reset link/token has been generated."
      );

      // You already paste the token manually from logs/email
      // and then reset on /reset-password
      router.push("/reset-password");
    } catch (err) {
      console.error("forgot password error:", err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="page-shell">
      <div className="card">
        <h1 className="card-title">Applicant Login</h1>
        <p className="card-subtitle">
          Sign in with your email and password.
        </p>

        <form onSubmit={handleLogin}>
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

          <div style={{ marginBottom: "0.75rem" }}>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <div
          style={{
            marginTop: "0.75rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.85rem",
          }}
        >
          <button
            type="button"
            className="btn-link"
            onClick={handleForgotPassword}
          >
            Forgot password?
          </button>
        </div>

        <div
          style={{
            marginTop: "1rem",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "1rem",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>
            Don&apos;t have an account yet?
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push("/applicant/register")}
          >
            Create an Applicant Account
          </button>
        </div>
      </div>
    </div>
  );
}

*/
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function parseApiResponse(res: Response) {
  const raw = await res.json().catch(() => ({} as any));

  // Lambda proxy style: { statusCode, body: "json-string" }
  if (typeof raw.statusCode === "number" && raw.body !== undefined) {
    let inner: any = raw.body;
    if (typeof inner === "string") {
      try {
        inner = JSON.parse(inner);
      } catch {
        inner = {};
      }
    }
    return { statusCode: raw.statusCode, payload: inner };
  }

  // Normal JSON style
  return { statusCode: res.status, payload: raw };
}

export default function ApplicantLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/applicants/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);

      if (statusCode === 200) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", payload?.token || "");
          localStorage.setItem("email", email);
        }
        router.push("/applicant/home");
        return;
      }

      if (statusCode === 401) {
        setError(
          payload?.message || "Incorrect credentials. Please try again."
        );
      } else {
        setError(payload?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setInfo(null);

    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/applicants/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to start password reset.");
        return;
      }

      // Your Lambda returns { message, token }, but we also check resetToken just in case
      const resetToken =
        payload?.token ||
        payload?.resetToken ||
        payload?.data?.token ||
        payload?.data?.resetToken;

      setInfo(
        payload?.message ||
          "If an account exists, a reset token has been generated."
      );

      // If Lambda returned a token, include it in the URL so reset page can autofill
      if (resetToken) {
        router.push(
          `/reset-password?email=${encodeURIComponent(
            email
          )}&token=${encodeURIComponent(resetToken)}`
        );
      } else {
        // Fallback: still let user go to reset page, they can paste manually
        router.push("/reset-password");
      }
    } catch (err) {
      console.error("forgot password error:", err);
      setError("Network error. Please try again.");
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
          Applicant Login
        </h1>
        <p
          style={{
            color: "#6b7280",
            fontSize: "1rem",
            marginBottom: "2rem",
          }}
        >
          Sign in with your email and password.
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 500,
                fontSize: "0.95rem",
                marginBottom: "0.35rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "9999px",
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 500,
                fontSize: "0.95rem",
                marginBottom: "0.35rem",
              }}
            >
              Password
            </label>
            <input
              type="password"
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "9999px",
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              marginBottom: "0.75rem",
            }}
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.9rem",
            marginBottom: "1.25rem",
          }}
        >
          <button
            type="button"
            onClick={handleForgotPassword}
            style={{
              border: "none",
              background: "none",
              color: "#2563eb",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Forgot password?
          </button>
        </div>

        <hr style={{ borderColor: "#e5e7eb", marginBottom: "1.25rem" }} />

        <p
          style={{
            fontSize: "0.95rem",
            color: "#4b5563",
            marginBottom: "0.5rem",
          }}
        >
          Don&apos;t have an account yet?
        </p>
        <button
          type="button"
          onClick={() => router.push("/applicant/register")}
          style={{
            width: "100%",
            padding: "0.9rem 1rem",
            borderRadius: "9999px",
            border: "none",
            backgroundColor: "#eef2ff",
            color: "#1d4ed8",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          Create an Applicant Account
        </button>
      </div>
    </div>
  );
}