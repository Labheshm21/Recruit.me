"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_COMPANY_PROFILE_URL ||
  "https://l4yk6moh6d.execute-api.us-east-2.amazonaws.com/Initial/companyprofile";

const GET_PROFILE_URL =
  process.env.NEXT_PUBLIC_GET_COMPANY_PROFILE_URL ||
  "https://k2wchs7hd5.execute-api.us-east-2.amazonaws.com/Initial/getcompanyprofile";

export default function EditProfile() {
  const router = useRouter();

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  // Load from localStorage as fallback
  function loadFromLocalStorage(): void {
    const storedCompanyName = localStorage.getItem("company_name");
    const storedAboutCompany = localStorage.getItem("about_company");
    const storedPhone = localStorage.getItem("company_phone");
    const storedOfficeAddress = localStorage.getItem("office_address");

    if (storedCompanyName) setCompanyName(storedCompanyName);
    if (storedAboutCompany) setAboutCompany(storedAboutCompany);
    if (storedPhone) setPhone(storedPhone);
    if (storedOfficeAddress) setOfficeAddress(storedOfficeAddress);
  }

  // Fetch existing profile data
  async function fetchExistingProfile(id: string | null, storedEmail: string | null): Promise<void> {
    setFetching(true);
    try {
      const res = await fetch(GET_PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: id ? Number(id) : undefined,
          email: storedEmail || undefined,
        }),
      });

      const data = await res.json();
      console.log("Fetched profile:", data);

      // Handle different response structures
      const profile = data.company || data;
      
      if (profile && (profile.company_name || profile.email)) {
        setCompanyName(profile.company_name || "");
        setAboutCompany(profile.about_company || "");
        setPhone(profile.phone || "");
        setOfficeAddress(profile.office_address || "");
        if (profile.email) setEmail(profile.email);
      } else {
        // API didn't return valid data, load from localStorage
        loadFromLocalStorage();
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      // Network error - fall back to localStorage
      loadFromLocalStorage();
    }
    setFetching(false);
  }

  // Load saved company info from localStorage and fetch profile
  useEffect(() => {
    const storedId = localStorage.getItem("company_id");
    const storedEmail = localStorage.getItem("company_email") || localStorage.getItem("companyEmail");
    
    if (!storedId && !storedEmail) {
      router.push("/company/login");
      return;
    }
    
    setCompanyId(storedId);
    if (storedEmail) setEmail(storedEmail);
    
    fetchExistingProfile(storedId, storedEmail);
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");

    if (!companyName.trim()) {
      setMessage("Company name is required.");
      return;
    }

    const payload = {
      company_id: companyId ? Number(companyId) : undefined,
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
        // Save to localStorage for offline access
        localStorage.setItem("company_name", companyName);
        localStorage.setItem("about_company", aboutCompany);
        localStorage.setItem("company_phone", phone);
        localStorage.setItem("office_address", officeAddress);

        setMessage("Profile updated successfully!");

        setTimeout(() => {
          router.push("/company/profile");
        }, 1200);
      } else {
        setMessage(data.error || "Update failed");
      }
    } catch (err: any) {
      // Even if API fails, save locally
      localStorage.setItem("company_name", companyName);
      localStorage.setItem("about_company", aboutCompany);
      localStorage.setItem("company_phone", phone);
      localStorage.setItem("office_address", officeAddress);

      setMessage("Saved locally. Server sync failed: " + err.message);
      
      setTimeout(() => {
        router.push("/company/profile");
      }, 2000);
    }

    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          background: "#fff",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Company Profile</h1>
          <Link
            href="/company/profile"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            ← Back to Profile
          </Link>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>

          <label className="block text-sm font-medium text-gray-700 mb-1">Email (Cannot be changed)</label>
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

        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Acme Corp"
          style={inputStyle}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">About Company</label>
        <textarea
          value={aboutCompany}
          onChange={(e) => setAboutCompany(e.target.value)}
          placeholder="Short company description"
          style={{ ...inputStyle, height: 90 }}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1 555-1234"
          style={inputStyle}
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
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
