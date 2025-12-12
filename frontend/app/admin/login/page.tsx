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

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const adminEmail = localStorage.getItem("admin_email");
    if (adminEmail) router.push("/admin/home");
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setMessage(payload?.message || "Login failed.");
        setLoading(false);
        return;
      }

      // expected: payload.admin = {id, email, fullName}
      const admin = payload.admin || payload.user || {};
      localStorage.setItem("admin_email", admin.email || email);
      if (admin.id) localStorage.setItem("admin_id", String(admin.id));
      if (admin.fullName) localStorage.setItem("admin_name", admin.fullName);

      router.push("/admin/home");
    } catch (err: any) {
      setMessage("Network error: " + (err?.message || "Failed to fetch"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#F3F4F6", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 560, background: "#fff", borderRadius: 20, padding: 36, border: "1px solid #E5E7EB", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111827" }}>Admin Login</h1>
        <p style={{ marginTop: 8, marginBottom: 24, color: "#6B7280" }}>
          Sign in to access platform reports.
        </p>

        <form onSubmit={handleLogin}>
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
            placeholder="********"
          />

          <button type="submit" disabled={loading} style={button(loading)}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: 14, fontWeight: 600, color: "#B91C1C" }}>
            {message}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <a href="/admin/forgot-password" style={link}>Forgot password?</a>
          <a href="/admin/signup" style={link}>Create admin account</a>
        </div>

        <div style={{ marginTop: 22 }}>
          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 9999,
              border: "1px solid #D1D5DB",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 700,
              color: "#374151",
            }}
          >
            ← Back to main landing
          </button>
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
