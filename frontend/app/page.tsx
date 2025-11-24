"use client";

export default function LandingPage() {
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
      {/* HERO SECTION */}
      <h1
        style={{
          fontSize: "42px",
          fontWeight: 800,
          marginBottom: "10px",
          color: "#111827",
          textAlign: "center",
        }}
      >
        Welcome to Recruit.me
      </h1>

      <p
        style={{
          fontSize: "18px",
          color: "#374151",
          maxWidth: "700px",
          textAlign: "center",
          marginBottom: "40px",
          lineHeight: 1.6,
        }}
      >
        A modern hiring and job application platform designed to connect
        talented individuals with growing companies. Choose your role to
        continue.
      </p>

      {/* ACTION CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
          width: "100%",
          maxWidth: "900px",
        }}
      >
        {/* COMPANY CARD */}
        <a
          href="/company/login"
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              padding: "30px",
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#2563EB",
              }}
            >
              Company
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#6B7280",
                marginTop: "10px",
              }}
            >
              Post jobs, manage applicants, and grow your organization with
              our easy-to-use company tools.
            </p>
          </div>
        </a>

        {/* APPLICANT CARD */}
        <a
          href="/applicant/login"
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              padding: "30px",
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#10B981",
              }}
            >
              Applicant
            </h2>
            <p
              style={{
                fontSize: "15px",
                color: "#6B7280",
                marginTop: "10px",
              }}
            >
              Apply for jobs, track your applications, and explore new
              career opportunities tailored for your skillset.
            </p>
          </div>
        </a>
      </div>

      {/* FOOTER */}
      <p
        style={{
          marginTop: "60px",
          fontSize: "14px",
          color: "#9CA3AF",
        }}
      >
        © {new Date().getFullYear()} Recruit.me — All rights reserved.
      </p>
    </div>
  );
}
