"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  skills: string;
  description: string;
};

// Normalize Lambda proxy or normal JSON
function parseLambdaResponse(outer: any, res: Response) {
  const statusCode =
    typeof outer?.statusCode === "number" ? outer.statusCode : res.status;

  let payload: any = {};

  if (typeof outer?.body === "string") {
    try {
      payload = JSON.parse(outer.body);
    } catch {
      payload = {};
    }
  } else if (outer?.body) {
    payload = outer.body;
  } else {
    payload = outer;
  }

  return { statusCode, payload };
}

export default function ApplicantHomePage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [emailChecked, setEmailChecked] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [actionMessage, setActionMessage] = useState("");

  // Load email
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      router.push("/applicant/login");
      return;
    }
    setEmail(storedEmail);
    setEmailChecked(true);
  }, [router]);

  // Load jobs + applied jobs once email is confirmed
  useEffect(() => {
    if (!emailChecked) return;
    fetchJobs(1, searchTerm);
    if (email) fetchAppliedJobs(email);
  }, [emailChecked, email]);

  /* ---------------- FETCH JOBS ---------------- */
  const fetchJobs = async (page: number, term: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/applicants/jobs/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchTerm: term, page }),
      });

      const outer = await res.json().catch(() => ({}));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to load jobs.");
        setJobs([]);
        return;
      }

      setJobs(payload.jobs || []);
      setCurrentPage(payload.currentPage || page);
      setTotalPages(payload.totalPages || 1);
    } catch (err) {
      console.error("fetchJobs error:", err);
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  /* -------- FETCH JOBS APPLIED BY USER -------- */
  const fetchAppliedJobs = async (userEmail: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applicants/jobs/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const outer = await res.json().catch(() => ({}));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) return;

      const ids =
        (payload.applications || []).map(
          (a: { jobId: number }) => a.jobId
        ) ?? [];

      setAppliedJobIds(ids);
    } catch (err) {
      console.error("fetchAppliedJobs error:", err);
    }
  };

  /* ---------------- APPLY TO JOB ---------------- */
  const handleApply = async (jobId: number) => {
    setActionMessage("");

    if (!email) {
      router.push("/applicant/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/applicants/jobs/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, jobId }),
      });

      const outer = await res.json().catch(() => ({}));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setActionMessage(payload?.message || "Could not apply.");
        return;
      }

      setActionMessage(payload?.message || "Application submitted.");
      setAppliedJobIds((prev) =>
        prev.includes(jobId) ? prev : [...prev, jobId]
      );
    } catch (err) {
      console.error("handleApply error:", err);
      setActionMessage("Network error.");
    }
  };

  /* ---------------- PAGINATION ---------------- */
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchJobs(page, searchTerm);
  };

  const renderPageButtons = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
      <button
        key={num}
        onClick={() => handlePageChange(num)}
        className={num === currentPage ? "is-active" : ""}
      >
        {num}
      </button>
    ));
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    router.push("/applicant/login");
  };

  return (
    <div className="page-shell--scroll">
      <div className="card-wide">

        {/* TOP NAVIGATION */}
        <div className="nav-top">
          <button className="nav-chip" onClick={() => router.push("/applicant/profile")}>
            Profile
          </button>

          <button className="nav-chip" onClick={() => router.push("/applicant/applications")}>
            My Applications
          </button>

          {/* NEW — MY OFFERS */}
          <button className="nav-chip" onClick={() => router.push("/applicant/offers")}>
            My Offers
          </button>

          <button className="nav-chip nav-chip--primary" onClick={handleLogout}>
            Log Out
          </button>
        </div>

        {/* TITLE */}
        <h1 className="card-title">Job Search</h1>
        <p className="card-subtitle">
          Search for jobs and apply directly to your preferred companies.
        </p>

        {/* SEARCH BAR */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            className="input"
            placeholder="Search by company or skills…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-primary" onClick={() => fetchJobs(1, searchTerm)}>
            Search
          </button>
        </div>

        {/* JOB LIST */}
        <div className="jobs-container">
          {loading ? (
            <p>Loading jobs…</p>
          ) : error ? (
            <p style={{ color: "#b91c1c" }}>{error}</p>
          ) : jobs.length === 0 ? (
            <p>No jobs found.</p>
          ) : (
            jobs.map((job) => {
              const applied = appliedJobIds.includes(job.id);

              return (
                <div key={job.id} className="job-card">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <strong>{job.title}</strong>
                      <div style={{ fontSize: "0.85rem", color: "#4b5563" }}>
                        {job.company} · {job.location}
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      disabled={applied}
                      onClick={() => handleApply(job.id)}
                      style={{ opacity: applied ? 0.6 : 1 }}
                    >
                      {applied ? "Applied" : "Apply"}
                    </button>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    Skills: {job.skills}
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    {job.description}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FEEDBACK */}
        {actionMessage && (
          <p style={{ marginTop: "10px", color: "#166534" }}>{actionMessage}</p>
        )}

        {/* PAGINATION */}
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)}>←</button>
          {renderPageButtons()}
          <button onClick={() => handlePageChange(currentPage + 1)}>→</button>
        </div>
      </div>
    </div>
  );
}