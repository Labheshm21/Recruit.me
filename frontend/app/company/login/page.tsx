"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LOGIN_URL =
  process.env.NEXT_PUBLIC_COMPANY_LOGIN_URL ||
  "https://k2wchs7hd5.execute-api.us-east-2.amazonaws.com/Initial/companylogin";

export default function CompanyLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Login successful! Redirecting...");

        // SAVE TOKEN IF YOUR BACKEND RETURNS ONE
        if (data.token) {
          localStorage.setItem("companyToken", data.token);
        }

        localStorage.setItem("companyEmail", email);

        // REDIRECT TO DASHBOARD
        setTimeout(() => {
          router.push("/company/dashboard");
        }, 1200);
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (err: any) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: "5rem auto", padding: 30, background: "#fff", borderRadius: 8 }}>
      <h2 style={{ textAlign: "center" }}>Company Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 15, padding: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 15, padding: 10 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10 }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && (
          <p style={{ marginTop: 15, textAlign: "center", color: "red" }}>{message}</p>
        )}
      </form>
    </div>
  );
}
