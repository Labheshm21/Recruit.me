"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_COMPANY_PROFILE_URL ||
  "https://l4yk6moh6d.execute-api.us-east-2.amazonaws.com/Initial/companyprofile";

export default function EditProfile() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load saved company email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("companyEmail");
    if (!storedEmail) {
      router.push("/company/login");
      return;
    }
    setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");

    if (!companyName.trim()) {
      setMessage("Company name is required.");
      return;
    }

    const payload = {
      email: email,  // required for WHERE email = ?
      company_name: companyName,
      about_company: aboutCompany,
      phone: phone,
      office_address: officeAddress,
    };

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
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

      if (res.ok) {
        setMessage("Profile updated successfully!");

        setTimeout(() => {
          router.push("/company/dashboard");
        }, 1200);
      } else {
        setMessage(data.error || "Update failed");
      }
    } catch (err: any) {
      setMessage("Network error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        background: "#fff",
        padding: 24,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h1>Edit Company Profile</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>

        <label>Email (Cannot be changed)</label>
        <input
          type="text"
          value={email}
          disabled
          style={{
            ...inputStyle,
            background: "#E5E7EB",
            cursor: "not-allowed",
          }}
        />

        <label>Company Name *</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Acme Corp"
          style={inputStyle}
        />

        <label>About Company</label>
        <textarea
          value={aboutCompany}
          onChange={(e) => setAboutCompany(e.target.value)}
          placeholder="Short company description"
          style={{ ...inputStyle, height: 90 }}
        />

        <label>Phone Number</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555-1234"
          style={inputStyle}
        />

        <label>Office Address</label>
        <input
          type="text"
          value={officeAddress}
          onChange={(e) => setOfficeAddress(e.target.value)}
          placeholder="123 Main Street, NY"
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={submitButtonStyle(loading)}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <p
            style={{
              marginTop: 15,
              fontWeight: 600,
              color: message.includes("success") ? "green" : "red",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

// Shared Styles
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "8px",
  background: "#F9FAFB",
  border: "1px solid #E5E7EB",
  fontSize: "15px",
};

const submitButtonStyle = (loading: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "12px",
  background: loading ? "#9CA3AF" : "#2563EB",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: loading ? "not-allowed" : "pointer",
  marginTop: "20px",
  fontSize: "16px",
  fontWeight: "600",
});
