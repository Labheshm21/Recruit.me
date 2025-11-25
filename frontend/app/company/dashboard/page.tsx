"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyDashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Load email + theme from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("company_email");
      if (storedEmail) setEmail(storedEmail);

      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark") setDarkMode(true);
    }
  }, []);

  // Persist theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    }
  }, [darkMode]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("company_email");
      localStorage.removeItem("token");
      localStorage.removeItem("email");
    }
    router.push("/company/login");
  }

  const bgPage = darkMode ? "#020617" : "#F3F4F6";
  const textColor = darkMode ? "#E5E7EB" : "#111827";
  const cardBg = darkMode ? "#0F172A" : "#FFFFFF";
  const cardInnerBg = darkMode ? "#020617" : "#F9FAFB";
  const borderColor = darkMode ? "#1F2937" : "#E5E7EB";
  const mutedText = darkMode ? "#9CA3AF" : "#6B7280";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bgPage,
        color: textColor,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* NAVBAR */}
      <header
        style={{
          height: 64,
          borderBottom: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          background: darkMode ? "#020617" : "#FFFFFF",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background:
                "linear-gradient(135deg, #2563EB, #4F46E5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "white",
              fontSize: 18,
            }}
          >
            R
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              Recruit.me Company
            </div>
            <div
              style={{
                fontSize: 12,
                color: mutedText,
              }}
            >
              Company Portal
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {email && (
            <span
              style={{
                fontSize: 13,
                color: mutedText,
              }}
            >
              {email}
            </span>
          )}

          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: `1px solid ${borderColor}`,
              background: darkMode ? "#0F172A" : "#F9FAFB",
              color: textColor,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "none",
              background: "#EF4444",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* BODY: SIDEBAR + MAIN */}
      <div
        style={{
          display: "flex",
          flex: 1,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          padding: "16px 16px 24px 16px",
          boxSizing: "border-box",
          gap: 16,
        }}
      >
        {/* SIDEBAR */}
        <aside
          style={{
            width: 230,
            minWidth: 200,
            background: cardBg,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
            padding: 16,
            height: "fit-content",
            position: "sticky",
            top: 80,
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 0.06,
              color: mutedText,
            }}
          >
            Navigation
          </div>

          <SidebarLink
            label="Dashboard"
            href="/company/dashboard"
            active
            darkMode={darkMode}
          />
          <SidebarLink
            label="View All Jobs"
            href="/company/jobs"
            darkMode={darkMode}
          />
          <SidebarLink
            label="Create Job"
            href="/company/create-job"
            darkMode={darkMode}
          />
          <SidebarLink
            label="Edit Job"
            href="/company/edit-job"
            darkMode={darkMode}
          />
          <SidebarLink
            label="Activate Job"
            href="/company/activate-job"
            darkMode={darkMode}
          />
          <SidebarLink
            label="Deactivate Job"
            href="/company/deactivate-job"
            darkMode={darkMode}
          />
          <SidebarLink
            label="Company Profile"
            href="/company/profile"
            darkMode={darkMode}
          />
        </aside>

        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            background: cardBg,
            borderRadius: 12,
            border: `1px solid ${borderColor}`,
            padding: 24,
          }}
        >
          {/* Header section inside card */}
          <div
            style={{
              background: darkMode
                ? "linear-gradient(135deg, #1D4ED8, #4F46E5)"
                : "linear-gradient(135deg, #2563EB, #3B82F6)",
              padding: 24,
              borderRadius: 12,
              color: "white",
              marginBottom: 24,
            }}
          >
            <h1 style={{ margin: 0, fontSize: 24 }}>
              Company Dashboard
            </h1>
            <p style={{ marginTop: 10, opacity: 0.9, fontSize: 14 }}>
              Welcome {email ? email : "Company User"}
            </p>
            <p style={{ marginTop: 4, opacity: 0.8, fontSize: 13 }}>
              Quickly manage your jobs and company profile from this panel.
            </p>
          </div>

          {/* ACTION CARDS GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 18,
            }}
          >
            <ActionCard
              title="View All Jobs"
              description="See all your job postings with status."
              link="/company/jobs"
              color="#7C3AED"
              darkMode={darkMode}
              bg={cardInnerBg}
              border={borderColor}
            />
            <ActionCard
              title="Create Job"
              description="Post a new job to the platform."
              link="/company/create-job"
              color="#2563EB"
              darkMode={darkMode}
              bg={cardInnerBg}
              border={borderColor}
            />
            <ActionCard
              title="Edit Job"
              description="Update job details by Job ID."
              link="/company/edit-job"
              color="#4F46E5"
              darkMode={darkMode}
              bg={cardInnerBg}
              border={borderColor}
            />
            <ActionCard
              title="Activate Job"
              description="Make a job visible to applicants."
              link="/company/activate-job"
              color="#16A34A"
              darkMode={darkMode}
              bg={cardInnerBg}
              border={borderColor}
            />
            <ActionCard
              title="Deactivate Job"
              description="Temporarily hide a job posting."
              link="/company/deactivate-job"
              color="#DC2626"
              darkMode={darkMode}
              bg={cardInnerBg}
              border={borderColor}
            />
            <ActionCard
              title="Company Profile"
              description="View and manage your company information."
              link="/company/profile"
              color="#0891B2"
              darkMode={darkMode}
              bg={cardInnerBg}
              border={borderColor}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------- Sidebar Link ---------------- */

function SidebarLink({
  label,
  href,
  active,
  darkMode,
}: {
  label: string;
  href: string;
  active?: boolean;
  darkMode: boolean;
}) {
  const baseBg = darkMode ? "#020617" : "#F9FAFB";
  const baseColor = darkMode ? "#E5E7EB" : "#111827";

  return (
    <a
      href={href}
      style={{
        display: "block",
        fontSize: 14,
        padding: "8px 10px",
        borderRadius: 8,
        marginBottom: 6,
        textDecoration: "none",
        background: active ? "rgba(37,99,235,0.12)" : "transparent",
        color: active ? "#2563EB" : baseColor,
        cursor: "pointer",
      }}
    >
      {label}
    </a>
  );
}

/* ---------------- Action Card ---------------- */

function ActionCard({
  title,
  description,
  link,
  color,
  darkMode,
  bg,
  border,
}: {
  title: string;
  description: string;
  link: string;
  color: string;
  darkMode: boolean;
  bg: string;
  border: string;
}) {
  return (
    <a
      href={link}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          padding: 18,
          borderRadius: 12,
          background: bg,
          border: `1px solid ${border}`,
          transition: "all 0.2s ease",
          cursor: "pointer",
          boxShadow: "0 0 0 rgba(0,0,0,0)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 8px 20px rgba(0,0,0,0.18)";
          e.currentTarget.style.transform = "translateY(-3px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <h2
          style={{
            marginBottom: 8,
            fontSize: 18,
            color,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: darkMode ? "#9CA3AF" : "#6B7280",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      </div>
    </a>
  );
}
