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
  const [message, setMessage] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || data.message || "Login failed");
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("company_email", email);
      }

      setMessage("Login successful! Redirecting...");
      setTimeout(() => router.push("/company/dashboard"), 1500);
    } catch (err: any) {
      setMessage("Network error: " + err.message);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F3F4F6",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: 700 }}>Company Login</h1>
        <p style={{ marginBottom: 30, color: "#6B7280" }}>
          Sign in with your company credentials.
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            style={input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            style={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" style={button}>
            Login
          </button>
        </form>

        <p style={{ color: "red", marginTop: 20 }}>{message}</p>

        <hr style={{ margin: "30px 0" }} />

        <a
          href="/company/signup"
          style={{
            display: "block",
            textAlign: "center",
            padding: "14px",
            background: "#EEF2FF",
            borderRadius: "40px",
            color: "#2563EB",
            fontWeight: "600",
            textDecoration: "none",
          }}
        >
          Create a Company Account
        </a>
      </div>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "40px",
  border: "1px solid #E5E7EB",
  marginBottom: "20px",
  background: "#F9FAFB",
};

const button: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  background: "#2563EB",
  color: "white",
  borderRadius: "40px",
  border: "none",
  marginTop: "10px",
  fontWeight: "600",
  cursor: "pointer",
};
