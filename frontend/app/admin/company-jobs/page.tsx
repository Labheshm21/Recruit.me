"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type CompanyOption = {
  companyId: number;
  companyName: string;
};

type JobRow = {
  jobId: number;
  jobName: string;
  location: string;
  jobStatus: string;
  applicationsTotal: number;
  applied: number;
  offered: number;
  hired: number;
  withdrawn: number;
};

async function parseApiResponse(res: Response) {
  const raw = await res.json().catch(() => ({} as any));
  if (typeof raw.statusCode === "number" && raw.body !== undefined) {
    let inner: any = raw.body;
    if (typeof inner === "string") {
      try {
        inner = JSON.parse(inner);
      } catch {
        inner = {};
      }
    }
    return { statusCode: raw.statusCode, payload: inner };
  }
  return { statusCode: res.status, payload: raw };
}

export default function AdminCompanyJobsPage() {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load company options
  useEffect(() => {
    const loadCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/companies/report`,
          { method: "POST" }
        );
        const { statusCode, payload } = await parseApiResponse(res);
        if (statusCode >= 400) {
          setError(payload?.message || "Failed to load companies.");
          return;
        }
        const list: CompanyOption[] = (payload.companies || []).map(
          (c: any) => ({
            companyId: c.companyId,
            companyName: c.companyName,
          })
        );
        setCompanies(list);
        if (list.length > 0) {
          setSelectedId(list[0].companyId);
        }
      } catch (err) {
        console.error(err);
        setError("Network error while loading companies.");
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  // Load jobs whenever company or page changes
  useEffect(() => {
    if (!selectedId) return;

    const loadJobs = async () => {
      setLoadingJobs(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/company-jobs/report`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyId: selectedId,
              page,
              pageSize: 10,
            }),
          }
        );
        const { statusCode, payload } = await parseApiResponse(res);
        if (statusCode >= 400) {
          setError(payload?.message || "Failed to load jobs report.");
          setJobs([]);
          return;
        }
        setJobs(payload.jobs || []);
        setTotalPages(payload.totalPages || 1);
      } catch (err) {
        console.error(err);
        setError("Network error while loading jobs.");
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobs();
  }, [selectedId, page]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    setSelectedId(id || null);
    setPage(1);
  };

  const changePage = (next: number) => {
    if (next < 1 || next > totalPages) return;
    setPage(next);
  };

  return (
    <div className="page-shell--scroll">
      <div className="card-wide">
        <h1 className="card-title">Admin · Jobs by Company</h1>
        <p className="card-subtitle">
          Select a company to see all its job postings and applicant counts.
        </p>

        {loadingCompanies ? (
          <p>Loading companies…</p>
        ) : companies.length === 0 ? (
          <p>No companies found.</p>
        ) : (
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                fontSize: "0.9rem",
                fontWeight: 500,
                marginRight: "0.5rem",
              }}
            >
              Company:
            </label>
            <select
              value={selectedId ?? ""}
              onChange={handleCompanyChange}
              style={{
                padding: "0.4rem 0.7rem",
                borderRadius: "9999px",
                border: "1px solid #d1d5db",
                minWidth: "220px",
              }}
            >
              {companies.map((c) => (
                <option key={c.companyId} value={c.companyId}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

        {selectedId && !loadingJobs && jobs.length === 0 && !error && (
          <p>No jobs found for this company.</p>
        )}

        {loadingJobs ? (
          <p>Loading jobs…</p>
        ) : jobs.length > 0 ? (
          <div style={{ overflowX: "auto", marginTop: "1rem" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>
                    Job
                  </th>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>
                    Location
                  </th>
                  <th style={{ textAlign: "center", padding: "0.5rem" }}>
                    Status
                  </th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>
                    Apps
                  </th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>
                    Applied
                  </th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>
                    Offered
                  </th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>
                    Hired
                  </th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>
                    Withdrawn
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.jobId}>
                    <td style={{ padding: "0.5rem", borderTop: "1px solid #e5e7eb" }}>
                      {j.jobName}
                    </td>
                    <td style={{ padding: "0.5rem", borderTop: "1px solid #e5e7eb" }}>
                      {j.location}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        borderTop: "1px solid #e5e7eb",
                        textAlign: "center",
                        textTransform: "capitalize",
                      }}
                    >
                      {j.jobStatus}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        borderTop: "1px solid #e5e7eb",
                        textAlign: "right",
                      }}
                    >
                      {j.applicationsTotal}
                    </td>
                    <td style={{ padding: "0.5rem", borderTop: "1px solid #e5e7eb", textAlign: "right" }}>
                      {j.applied}
                    </td>
                    <td style={{ padding: "0.5rem", borderTop: "1px solid #e5e7eb", textAlign: "right" }}>
                      {j.offered}
                    </td>
                    <td style={{ padding: "0.5rem", borderTop: "1px solid #e5e7eb", textAlign: "right" }}>
                      {j.hired}
                    </td>
                    <td style={{ padding: "0.5rem", borderTop: "1px solid #e5e7eb", textAlign: "right" }}>
                      {j.withdrawn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              className="pagination"
              style={{ marginTop: "0.75rem", justifyContent: "center" }}
            >
              <button onClick={() => changePage(page - 1)}>←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={p === page ? "is-active" : ""}
                >
                  {p}
                </button>
              ))}
              <button onClick={() => changePage(page + 1)}>→</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}