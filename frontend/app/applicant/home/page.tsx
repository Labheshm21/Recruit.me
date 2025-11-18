"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  skills: string;
  description: string;
};

async function parseApiResponse(res: Response) {
  const raw = await res.json().catch(() => ({} as any));

  if (raw && typeof raw.statusCode === "undefined") {
    return {
      httpStatus: res.status,
      statusCode: res.status,
      payload: raw,
    };
  }

  let inner: any = raw;
  if (raw && typeof raw.body === "string") {
    try {
      inner = JSON.parse(raw.body);
    } catch {
      inner = {};
    }
  }

  return {
    httpStatus: res.status,
    statusCode:
      typeof raw.statusCode === "number" ? raw.statusCode : res.status,
    payload: inner,
  };
}

export default function ApplicantHome() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [emailChecked, setEmailChecked] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Make sure user is logged in
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

  useEffect(() => {
    if (emailChecked) {
      fetchJobs(1, searchTerm);
      if (email) {
        fetchAppliedJobs(email);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailChecked, email]);

  const fetchJobs = async (page: number, term: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/applicants/jobs/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            searchTerm: term,
            page,
          }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);

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

  const fetchAppliedJobs = async (userEmail: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/applicants/jobs/applications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);
      if (statusCode >= 400) {
        console.warn("Failed to fetch applied jobs:", payload?.message);
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

  const handleSearchClick = () => {
    fetchJobs(1, searchTerm);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchJobs(page, searchTerm);
  };

  const handleApply = async (jobId: number) => {
    setActionMessage(null);
    if (!email) {
      router.push("/applicant/login");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/applicants/jobs/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, jobId }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);

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
          style={{
            fontWeight: currentPage === i ? "bold" : "normal",
            border: "1px solid #000",
            padding: "0.2rem 0.6rem",
          }}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div style={{ padding: "1rem", background: "#e0e0e0", minHeight: "100vh" }}>
      {/* Top nav */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        <button onClick={() => router.push("/applicant/profile")}>Profile</button>
        <button onClick={() => router.push("/applicant/applications")}>
          My Applications
        </button>
        <button /* placeholder */>My Offers</button>
        <button onClick={handleLogout}>Log Out</button>
      </div>

      {/* Center content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "4rem",
        }}
      >
        <h1>Logo</h1>

        {/* Search + list */}
        <div style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex" }}>
            <input
              placeholder="Search by Company or Skills"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "260px",
                padding: "0.4rem",
                border: "1px solid #000",
                borderRight: "none",
              }}
            />
            <button onClick={handleSearchClick}>Search</button>
          </div>

          <div
            style={{
              width: "360px",
              height: "170px",
              border: "1px solid #000",
              marginTop: "0.5rem",
              padding: "0.5rem",
              background: "#fff",
              overflowY: "auto",
            }}
          >
            {loading ? (
              <p>Loading jobs...</p>
            ) : error ? (
              <p style={{ color: "red" }}>{error}</p>
            ) : jobs.length === 0 ? (
              <p>No jobs found.</p>
            ) : (
              jobs.map((job) => {
                const applied = appliedJobIds.includes(job.id);
                return (
                  <div
                    key={job.id}
                    style={{
                      marginBottom: "0.7rem",
                      borderBottom: "1px solid #ddd",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    <strong>{job.title}</strong> <br />
                    <span>{job.company}</span> <br />
                    <small>{job.location}</small> <br />
                    <small>Skills: {job.skills}</small>
                    <br />
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applied}
                      style={{ marginTop: "0.3rem" }}
                    >
                      {applied ? "Applied" : "Apply"}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Action message */}
          {actionMessage && (
            <p style={{ marginTop: "0.5rem", color: "green" }}>{actionMessage}</p>
          )}

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
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
    </div>
  );
}
