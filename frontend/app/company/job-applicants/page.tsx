"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Applicant {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  name?: string;
  email?: string;
  applicant_name?: string;
  applicant_email?: string;
  application_status: string;
  applied_at?: string;
  application_date?: string;
  created_at?: string;
  resume_url?: string;
}

interface Job {
  id: number;
  job_name: string;
  job_status: string;
}

const GET_JOB_URL = "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/getjobdetails";
const VIEW_APPLICANTS_URL = "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/viewapplicants";

function JobApplicantsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("id");

  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [page, setPage] = useState<number>(1);
  const perPage = 10;

  async function loadData(): Promise<void> {
    if (!jobId) {
      setLoading(false);
      return;
    }

    try {
      const companyId = localStorage.getItem("company_id");

      // Load job details
      const jobRes = await fetch(GET_JOB_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: Number(companyId) }),
      });
      const jobData = await jobRes.json();
      const foundJob = (jobData.jobs || []).find((j: Job) => j.id === Number(jobId));
      setJob(foundJob || null);

      // Load applicants
      console.log("Fetching applicants for job_id:", jobId);
      const appRes = await fetch(VIEW_APPLICANTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: Number(jobId) }),
      });
      const appData = await appRes.json();
      console.log("Applicants API response:", appData);
      
      // Handle different response structures
      const applicantsList = appData.applicants || appData.data || appData.applications || [];
      console.log("Parsed applicants:", applicantsList);
      setApplicants(applicantsList);
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    const companyId = localStorage.getItem("company_id");
    if (!companyId) {
      router.push("/company/login");
      return;
    }
    loadData();
  }, [jobId]);

  // Pagination
  const totalPages = Math.ceil(applicants.length / perPage);
  const paginatedApplicants = applicants.slice((page - 1) * perPage, page * perPage);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F4F6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #E5E7EB", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 16, color: "#6B7280" }}>Loading applicants...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F4F6", padding: 32 }}>
        <div style={{ maxWidth: 500, margin: "0 auto", background: "white", borderRadius: 12, padding: 32, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#DC2626", marginBottom: 16 }}>Job Not Found</h1>
          <p style={{ color: "#6B7280", marginBottom: 24 }}>The job you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.</p>
          <Link href="/company/jobs" style={{ padding: "10px 20px", background: "#2563EB", color: "white", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: "4px 10px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      textTransform: "capitalize",
    };
    switch (status?.toLowerCase()) {
      case "pending":
        return { ...base, background: "#FEF3C7", color: "#92400E" };
      case "reviewed":
        return { ...base, background: "#DBEAFE", color: "#1E40AF" };
      case "accepted":
        return { ...base, background: "#D1FAE5", color: "#065F46" };
      case "rejected":
        return { ...base, background: "#FEE2E2", color: "#991B1B" };
      default:
        return { ...base, background: "#E5E7EB", color: "#374151" };
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", padding: "32px 16px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>👥 Applicants</h1>
            <p style={{ color: "#6B7280", marginTop: 4 }}>
              for <span style={{ fontWeight: 600, color: "#2563EB" }}>{job.job_name}</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href={`/company/job-details?id=${jobId}`} style={{ padding: "10px 20px", background: "white", color: "#374151", borderRadius: 8, textDecoration: "none", fontWeight: 500, fontSize: 14, border: "1px solid #D1D5DB" }}>
              📋 View Job
            </Link>
            <Link href="/company/jobs" style={{ padding: "10px 20px", background: "#E5E7EB", color: "#374151", borderRadius: 8, textDecoration: "none", fontWeight: 500, fontSize: 14 }}>
              ← Back to Jobs
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: "white", padding: 16, borderRadius: 12, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#2563EB", margin: 0 }}>{applicants.length}</p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Total Applicants</p>
          </div>
          <div style={{ background: "white", padding: 16, borderRadius: 12, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#F59E0B", margin: 0 }}>
              {applicants.filter(a => a.application_status?.toLowerCase() === "pending").length}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Pending</p>
          </div>
          <div style={{ background: "white", padding: 16, borderRadius: 12, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#10B981", margin: 0 }}>
              {applicants.filter(a => a.application_status?.toLowerCase() === "accepted").length}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Accepted</p>
          </div>
          <div style={{ background: "white", padding: 16, borderRadius: 12, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#EF4444", margin: 0 }}>
              {applicants.filter(a => a.application_status?.toLowerCase() === "rejected").length}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Rejected</p>
          </div>
        </div>

        {/* Applicants List */}
        {applicants.length === 0 ? (
          <div style={{ background: "white", borderRadius: 16, padding: 48, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <p style={{ fontSize: 48, margin: 0 }}>📭</p>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#374151", marginTop: 16 }}>No Applicants Yet</h2>
            <p style={{ color: "#6B7280", marginTop: 8 }}>When candidates apply for this job, they will appear here.</p>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            {/* Table Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr 1fr", padding: "16px 20px", background: "#F9FAFB", borderBottom: "1px solid #E5E7EB", fontWeight: 600, fontSize: 13, color: "#6B7280", textTransform: "uppercase" }}>
              <span>Name</span>
              <span>Email</span>
              <span>Applied</span>
              <span>Status</span>
            </div>

            {/* Table Rows */}
            {paginatedApplicants.map((applicant, index) => (
              <div
                key={applicant.id || index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.5fr 1fr 1fr",
                  padding: "16px 20px",
                  borderBottom: "1px solid #F3F4F6",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  {applicant.user_name || applicant.name || applicant.applicant_name || "N/A"}
                </span>
                <span style={{ color: "#6B7280", fontSize: 14 }}>
                  {applicant.user_email || applicant.email || applicant.applicant_email || "N/A"}
                </span>
                <span style={{ color: "#6B7280", fontSize: 14 }}>
                  {(applicant.applied_at || applicant.application_date || applicant.created_at) 
                    ? new Date(applicant.applied_at || applicant.application_date || applicant.created_at || "").toLocaleDateString() 
                    : "N/A"}
                </span>
                <span style={getStatusBadge(applicant.application_status || "pending")}>
                  {applicant.application_status || "Pending"}
                </span>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: 20, borderTop: "1px solid #E5E7EB" }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "8px 16px",
                    background: page === 1 ? "#E5E7EB" : "#2563EB",
                    color: page === 1 ? "#9CA3AF" : "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    fontWeight: 500,
                  }}
                >
                  ← Previous
                </button>
                <span style={{ padding: "0 16px", color: "#6B7280", fontSize: 14 }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: "8px 16px",
                    background: page === totalPages ? "#E5E7EB" : "#2563EB",
                    color: page === totalPages ? "#9CA3AF" : "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    fontWeight: 500,
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "4px solid #E5E7EB", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ marginTop: 16, color: "#6B7280" }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function JobApplicantsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <JobApplicantsContent />
    </Suspense>
  );
}
