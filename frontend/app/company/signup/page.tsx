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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ---------- STEP 1 VALIDATION ----------
  const validateStep1 = () => {
    if (!email.trim()) return "Email is required";
    if (!email.includes("@") || !email.includes(".")) return "Invalid email format";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  // ---------- SUBMIT COMPANY SIGNUP ----------
  const handleSubmit = async () => {
    setMessage(null);

    if (!companyName.trim()) {
      setMessage("Company name is required");
      return;
    }

    const payload = {
      email,
      password,
      confirmPassword,
      companyName,
      aboutCompany: aboutCompany || null,
      phone: phone || null,
      officeAddress: officeAddress || null,
    };

    setLoading(true);

    try {
      const res = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data = {};

      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      if (res.ok) {
        setMessage("Signup successful! Redirecting to login...");
        setTimeout(() => router.push("/company/login"), 1500);
      } else {
        setMessage(
          `Error (${res.status}): ${
            (data as any).message || (data as any).error || "Unknown error"
          }`
        );
      }
    } catch (err: any) {
      setMessage("Network/CORS error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Company Signup</h1>

      {/* ---------- STEP 1 ---------- */}
      {step === 1 && (
        <>
          <label>Email</label>
          <input
            type="email"
            placeholder="company@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 20 }}
          />

          <button
            onClick={() => {
              const err = validateStep1();
              if (err) return setMessage(err);

              setMessage(null);
              setStep(2);
            }}
            style={{
              width: "100%",
              padding: 12,
              background: "#0070f3",
              color: "#fff",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
          >
            Next →
          </button>
        </>
      )}

      {/* ---------- STEP 2 ---------- */}
      {step === 2 && (
        <>
          <label>Company Name</label>
          <input
            type="text"
            placeholder="Acme Corporation"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <label>About Company</label>
          <textarea
            placeholder="Short description"
            value={aboutCompany}
            onChange={(e) => setAboutCompany(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <label>Phone</label>
          <input
            type="text"
            placeholder="+1 555 1234"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <label>Office Address</label>
          <input
            type="text"
            placeholder="123 Office Street"
            value={officeAddress}
            onChange={(e) => setOfficeAddress(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 20 }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setStep(1)}
              style={{
                flex: 1,
                padding: 12,
                background: "#fff",
                border: "1px solid #0070f3",
                color: "#0070f3",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ← Back
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1,
                padding: 12,
                background: loading ? "#999" : "#0070f3",
                color: "#fff",
                borderRadius: 6,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </>
      )}

      {/* ---------- MESSAGE ---------- */}
      {message && (
        <p
          style={{
            marginTop: 20,
            padding: 12,
            background: "#f0f0f0",
            borderRadius: 6,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
