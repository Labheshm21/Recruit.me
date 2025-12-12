"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function parseLambdaResponse(outer: any, res: Response) {
  const statusCode = typeof outer?.statusCode === "number" ? outer.statusCode : res.status;

  let payload: any = {};
  if (typeof outer?.body === "string") {
    try { payload = JSON.parse(outer.body); } catch { payload = {}; }
  } else if (outer?.body) payload = outer.body;
  else payload = outer;

  return { statusCode, payload };
}

function isStrongPassword(pw: string) {
  // at least 8, with 1 uppercase, 1 lowercase, 1 number
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
}

export default function AdminSignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const adminEmail = localStorage.getItem("admin_email");
    if (adminEmail) router.push("/admin/home");
  }, [router]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed.includes("@")) {
      setMessage("Invalid email format.");
      return;
    }
    if (!isStrongPassword(password)) {
      setMessage("Password must be 8+ chars with uppercase, lowercase, and a number.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email: emailTrimmed, password }),
      });

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setMessage(payload?.message || "Signup failed.");
        setLoading(false);
        return;
      }

      // after signup, send to login
      router.push("/admin/login");
    } catch (err: any) {
      setMessage("Network error: " + (err?.message || "Failed to fetch"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#F3F4F6", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 560, background: "#fff", borderRadius: 20, padding: 36, border: "1px solid #E5E7EB", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827" }}>Admin Signup</h1>
        <p style={{ marginTop: 8, marginBottom: 24, color: "#6B7280" }}>
          Create an admin account to access reports.
        </p>

        <form onSubmit={handleSignup}>
          <label style={{ fontWeight: 600 }}>Full name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={input}
            placeholder="Admin Name"
          />

          <label style={{ fontWeight: 600 }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
            placeholder="admin@email.com"
          />

          <label style={{ fontWeight: 600 }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
            placeholder="8+ chars, upper/lower/number"
          />

          <button type="submit" disabled={loading} style={button(loading)}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 14, fontWeight: 600, color: "#B91C1C" }}>
            {message}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <a href="/admin/login" style={link}>Already have an account? Login</a>
          <a href="/" style={link}>Back to landing</a>
        </div>
      </div>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 9999,
  border: "1px solid #E5E7EB",
  marginTop: 8,
  marginBottom: 16,
  background: "#F9FAFB",
};

const button = (loading: boolean): React.CSSProperties => ({
  width: "100%",
  padding: 14,
  borderRadius: 9999,
  border: "none",
  background: loading ? "#9CA3AF" : "#F97316",
  color: "#fff",
  fontWeight: 800,
  cursor: loading ? "not-allowed" : "pointer",
});

const link: React.CSSProperties = {
  color: "#2563EB",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: 14,
};
