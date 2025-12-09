"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Job {
  id: number;
  job_name: string;
  job_type: string;
  location: string;
  job_status: string;
  job_description?: string;
  requirements?: string;
  salary?: string;
  skills?: string;
  work_mode?: string;
}

const GET_JOB_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/getjobdetails";

const ACTIVATE_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/activatejob";

const DEACTIVATE_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/deactivatejob";

function JobDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("id");

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  async function fetchJob(): Promise<void> {
    if (!jobId) {
      setError("No job ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const companyId = localStorage.getItem("company_id");

      const res = await fetch(GET_JOB_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId ? Number(companyId) : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.jobs) {
        const foundJob = data.jobs.find((j: Job) => j.id === Number(jobId));
        if (foundJob) {
          setJob(foundJob);
        } else {
          setError("Job not found");
        }
      } else {
        setError(data.error || "Failed to fetch job details");
      }
    } catch (err: unknown) {
      console.error("Error fetching job:", err);
      setError("Network error: " + (err as Error).message);
    }

    setLoading(false);
  }

  async function handleActivate(): Promise<void> {
    if (!job) return;
    setActionLoading(true);

    try {
      const res = await fetch(ACTIVATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.id }),
      });

      if (res.ok) {
        setJob({ ...job, job_status: "active" });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to activate job");
      }
    } catch (err) {
      console.error("Error activating job:", err);
      alert("Network error while activating job");
    }

    setActionLoading(false);
  }

  async function handleDeactivate(): Promise<void> {
    if (!job) return;
    setActionLoading(true);

    try {
      const res = await fetch(DEACTIVATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.id }),
      });

      if (res.ok) {
        setJob({ ...job, job_status: "inactive" });
      } else {
        const data = await res.json();
        alert(data.error || "Failed to deactivate job");
      }
    } catch (err) {
      console.error("Error deactivating job:", err);
      alert("Network error while deactivating job");
    }

    setActionLoading(false);
  }

  useEffect(() => {
    const companyId = localStorage.getItem("company_id");
    if (!companyId) {
      router.push("/company/login");
      return;
    }
    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F4F6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #E5E7EB", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 16, color: "#6B7280" }}>Loading job details...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F4F6", padding: 32 }}>
        <div style={{ maxWidth: 500, margin: "0 auto", background: "white", borderRadius: 12, padding: 32, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#DC2626", marginBottom: 16 }}>Job Not Found</h1>
          <p style={{ color: "#6B7280", marginBottom: 24 }}>{error || "Unable to load job details"}</p>
          <Link href="/company/jobs" style={{ padding: "10px 20px", background: "#2563EB", color: "white", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", padding: "32px 16px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <Link href="/company/jobs" style={{ padding: "10px 20px", background: "#E5E7EB", color: "#374151", borderRadius: 8, textDecoration: "none", fontWeight: 500, fontSize: 14 }}>
            ← Back to Jobs
          </Link>
          
          <div style={{ display: "flex", gap: 12 }}>
            <Link href={`/company/job-edit`} onClick={(e) => { e.preventDefault(); try { sessionStorage.setItem('editing_job_id', String(jobId)); } catch {} ; router.push('/company/job-edit'); }} style={{ padding: "10px 20px", background: "#2563EB", color: "white", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
              ✏️ Edit Job
            </Link>
            <Link href={`/company/job-applicants?id=${jobId}`} style={{ padding: "10px 20px", background: "#7C3AED", color: "white", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
              👥 View Applicants
            </Link>
          </div>
        </div>

        {/* Job Card */}
        <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          {/* Job Header */}
          <div style={{ background: "linear-gradient(135deg, #2563EB, #4F46E5)", padding: "32px", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{job.job_name}</h1>
                <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#BFDBFE" }}>📍 {job.location || "Remote"}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#BFDBFE" }}>💼 {job.job_type || "Full-time"}</span>
                  {job.salary && <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#BFDBFE" }}>💰 {job.salary}</span>}
                </div>
              </div>
              
              <div style={{ padding: "8px 16px", borderRadius: 20, background: job.job_status === "active" ? "#10B981" : "#EF4444", color: "white", fontSize: 14, fontWeight: 600 }}>
                {job.job_status === "active" ? "✓ Active" : "✗ Inactive"}
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div style={{ padding: 32 }}>
            
            {job.job_description && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 0 }}>Job Description</h3>
                <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{job.job_description}</p>
              </div>
            )}

            {job.skills && (
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 0 }}>Skills Required</h3>
                <p style={{ fontSize: 16, color: "#374151", lineHeight: 1.7, margin: 0 }}>{job.skills}</p>
              </div>
            )}

            {/* Job Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 24, paddingTop: 24, borderTop: "1px solid #E5E7EB" }}>
              <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Job ID</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: "4px 0 0 0", fontFamily: "monospace" }}>#{job.id}</p>
              </div>
              <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Job Type</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: "4px 0 0 0", textTransform: "capitalize" }}>{job.job_type || "Full-time"}</p>
              </div>
              <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Work Mode</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: "4px 0 0 0", textTransform: "capitalize" }}>{job.work_mode || "On-site"}</p>
              </div>
              <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Status</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: job.job_status === "active" ? "#10B981" : "#EF4444", margin: "4px 0 0 0", textTransform: "capitalize" }}>{job.job_status}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 32, paddingTop: 24, borderTop: "1px solid #E5E7EB", flexWrap: "wrap" }}>
              {job.job_status === "active" ? (
                <button onClick={handleDeactivate} disabled={actionLoading} style={{ padding: "12px 24px", background: actionLoading ? "#9CA3AF" : "#EF4444", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer" }}>
                  {actionLoading ? "Processing..." : "⏸️ Deactivate Job"}
                </button>
              ) : (
                <button onClick={handleActivate} disabled={actionLoading} style={{ padding: "12px 24px", background: actionLoading ? "#9CA3AF" : "#10B981", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: actionLoading ? "not-allowed" : "pointer" }}>
                  {actionLoading ? "Processing..." : "▶️ Activate Job"}
                </button>
              )}
              
              <Link href={`/company/job-edit`} onClick={(e) => { e.preventDefault(); try { sessionStorage.setItem('editing_job_id', String(jobId)); } catch {} ; router.push('/company/job-edit'); }} style={{ padding: "12px 24px", background: "#2563EB", color: "white", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                ✏️ Edit Job
              </Link>
              
              <Link href={`/company/job-applicants?id=${jobId}`} style={{ padding: "12px 24px", background: "#7C3AED", color: "white", borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
                👥 View Applicants
              </Link>
            </div>
          </div>
        </div>
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

export default function JobDetailsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <JobDetailsContent />
    </Suspense>
  );
}
