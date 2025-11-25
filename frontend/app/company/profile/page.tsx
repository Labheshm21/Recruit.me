"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CompanyProfile {
  id: number;
  email: string;
  company_name: string;
  about_company: string;
  phone: string;
  office_address: string;
}

const GET_PROFILE_URL =
  process.env.NEXT_PUBLIC_GET_COMPANY_PROFILE_URL ||
  "https://k2wchs7hd5.execute-api.us-east-2.amazonaws.com/Initial/getcompanyprofile";

export default function CompanyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [usingLocalData, setUsingLocalData] = useState<boolean>(false);

  function loadFromLocalStorage(): CompanyProfile | null {
    const companyId = localStorage.getItem("company_id");
    const companyEmail = localStorage.getItem("company_email");
    const companyName = localStorage.getItem("company_name");
    const aboutCompany = localStorage.getItem("about_company");
    const phone = localStorage.getItem("company_phone");
    const officeAddress = localStorage.getItem("office_address");

    if (companyEmail || companyName) {
      return {
        id: companyId ? Number(companyId) : 0,
        email: companyEmail || "",
        company_name: companyName || "Your Company",
        about_company: aboutCompany || "",
        phone: phone || "",
        office_address: officeAddress || "",
      };
    }
    return null;
  }

  async function fetchProfile(companyId: string | null, companyEmail: string | null): Promise<void> {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(GET_PROFILE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId ? Number(companyId) : undefined,
          email: companyEmail || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.company) {
        setProfile(data.company);
        saveToLocalStorage(data.company);
      } else if (res.ok && data && data.email) {
        setProfile(data);
        saveToLocalStorage(data);
      } else {
        const localProfile = loadFromLocalStorage();
        if (localProfile) {
          setProfile(localProfile);
          setUsingLocalData(true);
        } else {
          setError(data.error || "Failed to fetch profile");
        }
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      const localProfile = loadFromLocalStorage();
      if (localProfile) {
        setProfile(localProfile);
        setUsingLocalData(true);
      } else {
        setError("Unable to load profile. Please update your profile information.");
      }
    }

    setLoading(false);
  }

  function saveToLocalStorage(profileData: CompanyProfile): void {
    if (profileData.company_name) localStorage.setItem("company_name", profileData.company_name);
    if (profileData.about_company) localStorage.setItem("about_company", profileData.about_company);
    if (profileData.phone) localStorage.setItem("company_phone", profileData.phone);
    if (profileData.office_address) localStorage.setItem("office_address", profileData.office_address);
  }

  useEffect(() => {
    const companyId = localStorage.getItem("company_id");
    const companyEmail = localStorage.getItem("company_email");

    if (!companyId && !companyEmail) {
      router.push("/company/login");
      return;
    }

    fetchProfile(companyId, companyEmail);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: "4px solid #E5E7EB",
          borderTopColor: "#2563EB",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <p style={{ marginTop: 16, color: "#6B7280" }}>Loading profile...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error state (no profile data)
  if (error && !profile) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        padding: 32
      }}>
        <div style={{
          maxWidth: 500,
          margin: "0 auto",
          background: "white",
          borderRadius: 12,
          padding: 32,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#DC2626", marginBottom: 16 }}>
            Profile Not Found
          </h1>
          <p style={{ color: "#6B7280", marginBottom: 24 }}>{error}</p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/company/edit-profile" style={{
              padding: "10px 20px",
              background: "#2563EB",
              color: "white",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600
            }}>
              Set Up Profile
            </Link>
            <Link href="/company/dashboard" style={{
              padding: "10px 20px",
              background: "#E5E7EB",
              color: "#374151",
              borderRadius: 8,
              textDecoration: "none"
            }}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main profile view
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F3F4F6",
      padding: "32px 16px"
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        
        {/* Warning Banner */}
        {usingLocalData && (
          <div style={{
            marginBottom: 16,
            padding: 16,
            background: "#FEF3C7",
            border: "1px solid #FCD34D",
            borderRadius: 8,
            color: "#92400E",
            fontSize: 14
          }}>
            ⚠️ Showing cached profile data.{" "}
            <Link href="/company/edit-profile" style={{ textDecoration: "underline", fontWeight: 600, color: "#92400E" }}>
              Update your profile
            </Link>{" "}
            to sync with the server.
          </div>
        )}

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16
        }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>
              Company Profile
            </h1>
            <p style={{ color: "#6B7280", marginTop: 4, marginBottom: 0 }}>
              View and manage your company information
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/company/dashboard" style={{
              padding: "10px 20px",
              background: "#E5E7EB",
              color: "#374151",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 500,
              fontSize: 14
            }}>
              ← Dashboard
            </Link>
            <Link href="/company/edit-profile" style={{
              padding: "10px 20px",
              background: "#2563EB",
              color: "white",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14
            }}>
              ✏️ Edit Profile
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div style={{
          background: "white",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
        }}>
          {/* Profile Header */}
          <div style={{
            background: "linear-gradient(135deg, #2563EB, #4F46E5)",
            padding: "40px 32px",
            display: "flex",
            alignItems: "center",
            gap: 24
          }}>
            <div style={{
              width: 80,
              height: 80,
              background: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 700,
              color: "#2563EB",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
            }}>
              {profile?.company_name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "white" }}>
                {profile?.company_name || "Company Name"}
              </h2>
              <p style={{ color: "#BFDBFE", marginTop: 4, marginBottom: 0 }}>
                {profile?.email || "No email"}
              </p>
            </div>
          </div>

          {/* Profile Details */}
          <div style={{ padding: 32 }}>
            
            {/* About Section */}
            <div style={{ borderBottom: "1px solid #E5E7EB", paddingBottom: 24, marginBottom: 24 }}>
              <h3 style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 8,
                marginTop: 0
              }}>
                About Company
              </h3>
              <p style={{ fontSize: 16, color: "#111827", margin: 0, lineHeight: 1.6 }}>
                {profile?.about_company || (
                  <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>No description provided</span>
                )}
              </p>
            </div>

            {/* Contact Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 16
            }}>
              {/* Email */}
              <div style={{
                background: "#F9FAFB",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 16
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  background: "#DBEAFE",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20
                }}>
                  📧
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Email Address</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", margin: "4px 0 0 0" }}>
                    {profile?.email || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div style={{
                background: "#F9FAFB",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 16
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  background: "#D1FAE5",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20
                }}>
                  📞
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Phone Number</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", margin: "4px 0 0 0" }}>
                    {profile?.phone || <span style={{ color: "#9CA3AF" }}>Not provided</span>}
                  </p>
                </div>
              </div>

              {/* Address - Full width */}
              <div style={{
                background: "#F9FAFB",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 16,
                gridColumn: "1 / -1"
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  background: "#E9D5FF",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20
                }}>
                  📍
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Office Address</p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", margin: "4px 0 0 0" }}>
                    {profile?.office_address || <span style={{ color: "#9CA3AF" }}>Not provided</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Company ID */}
            <div style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: "1px solid #E5E7EB",
              fontSize: 13,
              color: "#9CA3AF"
            }}>
              Company ID: <span style={{ fontFamily: "monospace" }}>{profile?.id || localStorage.getItem("company_id")}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16
        }}>
          <Link href="/company/jobs" style={{
            background: "white",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: "#DBEAFE",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: 20
            }}>
              💼
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: "0 0 4px 0" }}>View Jobs</h3>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Manage your job postings</p>
          </Link>

          <Link href="/company/create-job" style={{
            background: "white",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: "#D1FAE5",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: 20
            }}>
              ➕
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: "0 0 4px 0" }}>Create Job</h3>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Post a new position</p>
          </Link>

          <Link href="/company/edit-profile" style={{
            background: "white",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}>
            <div style={{
              width: 48,
              height: 48,
              background: "#E9D5FF",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              fontSize: 20
            }}>
              ✏️
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: "0 0 4px 0" }}>Edit Profile</h3>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Update company details</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
