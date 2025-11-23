"use client";

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

export default function ApplicantRegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, and 1 special character."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/applicants/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode === 201) {
        alert("Registration successful");
        router.push("/applicant/login");
        return;
      }

      if (statusCode === 409) {
        setError(payload?.message || "Users already exists");
      } else {
        setError(payload?.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("signup error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="card">
        <h1 className="card-title">Create Applicant Account</h1>
        <p className="card-subtitle">
          Sign up to start searching and applying to jobs.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
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

          {/* Password */}
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p
              style={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                marginTop: "0.25rem",
              }}
            >
              Must contain at least one uppercase, one lowercase, and one
              special character.
            </p>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Confirm Password</label>
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
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.25rem",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "1rem",
          }}
        >
          <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
            Already have an account?
          </p>

          <button
            type="button"
            className="btn-secondary"
            style={{ marginTop: "0.5rem" }}
            onClick={() => router.push("/applicant/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}