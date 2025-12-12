"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const adminEmail = localStorage.getItem("admin_email");
    if (!adminEmail) router.push("/admin/login");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_name");
    router.push("/admin/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F3F4F6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      {/* HEADER */}
      <h1
        style={{
          fontSize: "36px",
          fontWeight: 800,
          marginBottom: "8px",
          color: "#111827",
          textAlign: "center",
        }}
      >
        Admin Dashboard
      </h1>

      <p
        style={{
          fontSize: "16px",
          color: "#4B5563",
          maxWidth: "720px",
          textAlign: "center",
          marginBottom: "20px",
          lineHeight: 1.6,
        }}
      >
        Review activity across the platform. Open any report to see detailed
        metrics on companies, posted jobs, and applicants.
      </p>

      {/* TOP ACTIONS */}
      <div style={{ width: "100%", maxWidth: "960px", display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            padding: "10px 16px",
            borderRadius: "9999px",
            border: "1px solid #D1D5DB",
            background: "#FFFFFF",
            fontSize: "14px",
            color: "#374151",
            cursor: "pointer",
          }}
        >
          ← Back to main landing
        </button>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: "10px 16px",
            borderRadius: "9999px",
            border: "1px solid #FED7AA",
            background: "#FFF7ED",
            fontSize: "14px",
            color: "#9A3412",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Log Out
        </button>
      </div>

      {/* CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
          width: "100%",
          maxWidth: "960px",
        }}
      >
        {/* Company Report */}
        <a href="/admin/companies" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              background: "#FFFFFF",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#2563EB", marginBottom: "6px" }}>
              Company Report
            </h2>
            <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.5 }}>
              View all registered companies, their status, and basic activity details.
            </p>
          </div>
        </a>

        {/* Company Jobs Report */}
        <a href="/admin/company-jobs" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              background: "#FFFFFF",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#10B981", marginBottom: "6px" }}>
              Company Jobs Report
            </h2>
            <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.5 }}>
              Inspect all jobs posted by companies, including job status and key details.
            </p>
          </div>
        </a>

        {/* Applicants Report */}
        <a href="/admin/applicants" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              background: "#FFFFFF",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#F97316", marginBottom: "6px" }}>
              Applicants Report
            </h2>
            <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.5 }}>
              Review all applicants in the system and their application activity.
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}
