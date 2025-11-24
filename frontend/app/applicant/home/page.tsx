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

// Helper to normalize Lambda proxy vs normal JSON responses
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

  // Check login and load email from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      router.push("/applicant/login");
      return;
    }
    setEmail(storedEmail);
    setEmailChecked(true);
  }, [router]);

  // Once we know the email, load jobs and applied jobs
  useEffect(() => {
    if (!emailChecked) return;
    fetchJobs(1, searchTerm);
    if (email) {
      fetchAppliedJobs(email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailChecked, email]);

  // Load jobs from Lambda (now backed by companyjobs)
  const fetchJobs = async (page: number, term: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/applicants/jobs/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchTerm: term, page }),
      });

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to load jobs.");
        setJobs([]);
        setLoading(false);
        return;
      }

      setJobs(payload.jobs || []);
      setCurrentPage(payload.currentPage || page);
      setTotalPages(payload.totalPages || 1);
    } catch (err) {
      console.error("fetchJobs error:", err);
      setError("Network error: could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  // Load list of jobs the user has already applied to
  const fetchAppliedJobs = async (userEmail: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/applicants/jobs/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        console.warn("Failed to fetch applied jobs", payload?.message);
        return;
      }

      const ids =
        (payload.applications || []).map(
          (a: { jobId: number }) => a.jobId
        ) ?? [];
      setAppliedJobIds(ids);
    } catch (err) {
      console.error("fetchAppliedJobs error:", err);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("email");
    }
    router.push("/applicant/login");
  };

  const handleSearch = () => {
    fetchJobs(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchJobs(page, searchTerm);
  };

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

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setActionMessage(payload?.message || "Could not apply to job.");
        return;
      }

      setActionMessage(payload?.message || "Application submitted.");
      setAppliedJobIds((prev) =>
        prev.includes(jobId) ? prev : [...prev, jobId]
      );
    } catch (err) {
      console.error("handleApply error:", err);
      setActionMessage("Network error: could not apply.");
    }
  };

  const renderPageButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={i === currentPage ? "is-active" : ""}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="page-shell--scroll">
      <div className="card-wide">
        {/* Top nav */}
        <div className="nav-top">
          <button
            className="nav-chip"
            onClick={() => router.push("/applicant/profile")}
          >
            Profile
          </button>
          <button
            className="nav-chip"
            onClick={() => router.push("/applicant/applications")}
          >
            My Applications
          </button>
          <button className="nav-chip">My Offers</button>
          <button
            className="nav-chip nav-chip--primary"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>

        <h1 className="card-title">Job Search</h1>
        <p className="card-subtitle">
          Search jobs by company name or skill keywords, then apply directly.
        </p>

        {/* Search bar */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <input
            className="input"
            placeholder="Search by company or skills…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="btn-primary"
            style={{ width: "auto", paddingInline: "1.1rem" }}
          >
            Search
          </button>
        </div>

        {/* Jobs list */}
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <div>
                      <strong>{job.title}</strong>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#4b5563",
                        }}
                      >
                        {job.company} · {job.location}
                      </div>
                    </div>

                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applied}
                      className="btn-primary"
                      style={{
                        width: "auto",
                        opacity: applied ? 0.6 : 1,
                      }}
                    >
                      {applied ? "Applied" : "Apply"}
                    </button>
                  </div>

                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#6b7280",
                    }}
                  >
                    Skills: {job.skills}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                      marginTop: "0.25rem",
                    }}
                  >
                    {job.description}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Apply feedback */}
        {actionMessage && (
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.9rem",
              color: "#166534",
            }}
          >
            {actionMessage}
          </p>
        )}

        {/* Pagination */}
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)}>
            ←
          </button>
          {renderPageButtons()}
          <button onClick={() => handlePageChange(currentPage + 1)}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}
