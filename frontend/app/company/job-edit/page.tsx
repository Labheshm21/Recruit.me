"use client";

import { Suspense, useEffect, useState, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Job {
  id: number;
  job_name: string;
  job_description: string;
  job_type: string;
  work_mode: string;
  job_status: string;
  skills: string;
  salary: string;
  location: string;
}

const GET_JOB_URL = "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/getjobdetails";
const EDIT_JOB_URL = "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/editjob";

function EditJobContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("id");

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [job, setJob] = useState<Job | null>(null);
  const [message, setMessage] = useState<string>("");

  async function loadJob(): Promise<void> {
    if (!jobId) {
      setLoading(false);
      return;
    }

    try {
      const companyId = localStorage.getItem("company_id");

      const res = await fetch(GET_JOB_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: Number(companyId) }),
      });

      const data = await res.json();
      const found = (data.jobs || []).find((j: Job) => j.id === Number(jobId));
      setJob(found || null);
    } catch (err) {
      console.error("Error loading job:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    const companyId = localStorage.getItem("company_id");
    if (!companyId) {
      router.push("/company/login");
      return;
    }
    loadJob();
  }, [jobId]);

  async function handleUpdate(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setMessage("");

    if (!job) return;

    setSaving(true);

    const payload = {
      job_id: jobId,
      job_name: job.job_name,
      job_description: job.job_description,
      job_type: job.job_type,
      work_mode: job.work_mode,
      job_status: job.job_status,
      skills: job.skills,
      salary: job.salary,
      location: job.location,
    };

    try {
      const res = await fetch(EDIT_JOB_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const out = await res.json();

      if (res.ok) {
        setMessage("Job updated successfully!");
        setTimeout(() => router.push("/company/jobs"), 1200);
      } else {
        setMessage(out.error || "Failed to update job");
      }
    } catch (err) {
      setMessage("Network error: " + (err as Error).message);
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F4F6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "4px solid #E5E7EB", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 16, color: "#6B7280" }}>Loading job...</p>
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #D1D5DB",
    fontSize: 15,
    marginBottom: 16,
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", padding: "32px 16px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: 0 }}>Edit Job</h1>
          <Link href="/company/jobs" style={{ padding: "10px 20px", background: "#E5E7EB", color: "#374151", borderRadius: 8, textDecoration: "none", fontWeight: 500, fontSize: 14 }}>
            ← Back to Jobs
          </Link>
        </div>

        {/* Form Card */}
        <div style={{ background: "white", borderRadius: 16, padding: 32, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
          <form onSubmit={handleUpdate}>
            
            <label style={labelStyle}>Job Title *</label>
            <input
              type="text"
              value={job.job_name}
              onChange={(e) => setJob({ ...job, job_name: e.target.value })}
              style={inputStyle}
              required
            />

            <label style={labelStyle}>Job Description</label>
            <textarea
              value={job.job_description || ""}
              onChange={(e) => setJob({ ...job, job_description: e.target.value })}
              style={{ ...inputStyle, height: 120, resize: "vertical" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Job Type</label>
                <select
                  value={job.job_type || "full-time"}
                  onChange={(e) => setJob({ ...job, job_type: e.target.value })}
                  style={inputStyle}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Work Mode</label>
                <select
                  value={job.work_mode || "on-site"}
                  onChange={(e) => setJob({ ...job, work_mode: e.target.value })}
                  style={inputStyle}
                >
                  <option value="on-site">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Location</label>
                <input
                  type="text"
                  value={job.location || ""}
                  onChange={(e) => setJob({ ...job, location: e.target.value })}
                  placeholder="e.g. New York, NY"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Salary</label>
                <input
                  type="text"
                  value={job.salary || ""}
                  onChange={(e) => setJob({ ...job, salary: e.target.value })}
                  placeholder="e.g. $80,000 - $100,000"
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={labelStyle}>Skills Required</label>
            <input
              type="text"
              value={job.skills || ""}
              onChange={(e) => setJob({ ...job, skills: e.target.value })}
              placeholder="e.g. JavaScript, React, Node.js"
              style={inputStyle}
            />

            <label style={labelStyle}>Status</label>
            <select
              value={job.job_status || "active"}
              onChange={(e) => setJob({ ...job, job_status: e.target.value })}
              style={inputStyle}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "14px 28px",
                  background: saving ? "#9CA3AF" : "#2563EB",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "💾 Save Changes"}
              </button>
              
              <Link href="/company/jobs" style={{
                padding: "14px 28px",
                background: "#E5E7EB",
                color: "#374151",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 500,
              }}>
                Cancel
              </Link>
            </div>

            {message && (
              <p style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 8,
                background: message.includes("success") ? "#D1FAE5" : "#FEE2E2",
                color: message.includes("success") ? "#065F46" : "#991B1B",
                fontWeight: 500,
              }}>
                {message}
              </p>
            )}
          </form>
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

export default function EditJobPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditJobContent />
    </Suspense>
  );
}
