"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SIGNUP_URL =
  process.env.NEXT_PUBLIC_COMPANY_SIGNUP_URL ||
  "https://k2wchs7hd5.execute-api.us-east-2.amazonaws.com/Initial/companysignup";

export default function CompanySignup() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function validateStep1() {
    if (!email.includes("@")) return "Invalid email";
    if (password.length < 8) return "Password must be 8+ characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  }

  async function handleSubmit() {
    const payload = {
      email,
      password,
      confirmPassword,
      companyName,
      aboutCompany,
      phone,
      officeAddress,
    };

    setLoading(true);
    try {
      const res = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (!res.ok) {
        setMessage(data.error || data.message || "Signup failed");
        setLoading(false);
        return;
      }

      setMessage("Signup successful! Redirecting...");

      setTimeout(() => {
        router.push("/company/login");
      }, 1500);
    } catch (err: any) {
      setMessage("Network error: " + err.message);
    }

    setLoading(false);
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
        <h1 style={{ fontSize: "32px", fontWeight: 700 }}>
          Create Company Account
        </h1>
        <p style={{ marginBottom: 30, color: "#6B7280" }}>
          Sign up to start posting jobs and managing applicants.
        </p>

        {step === 1 && (
          <>
            <label>Email</label>
            <input
              style={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />

            <label>Password</label>
            <input
              style={input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />

            <label>Confirm Password</label>
            <input
              style={input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
            />

            <button
              style={button}
              onClick={() => {
                const err = validateStep1();
                if (err) return setMessage(err);
                setMessage("");
                setStep(2);
              }}
            >
              Next →
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label>Company Name</label>
            <input
              style={input}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <label>About Company</label>
            <textarea
              style={textarea}
              value={aboutCompany}
              onChange={(e) => setAboutCompany(e.target.value)}
            />

            <label>Phone</label>
            <input
              style={input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <label>Office Address</label>
            <input
              style={input}
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
            />

            <button
              style={button}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </>
        )}

        <p style={{ color: "red", marginTop: 20 }}>{message}</p>

        <hr style={{ margin: "30px 0" }} />

        <a
          href="/company/login"
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
          Go to Login
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

const textarea: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "12px",
  border: "1px solid #E5E7EB",
  marginBottom: "20px",
  background: "#F9FAFB",
  minHeight: 80,
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
