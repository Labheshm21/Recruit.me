"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type CompanyRow = {
  companyId: number;
  companyName: string;
  jobCount: number;
  applicationCount: number;
  hiredCount: number;
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

export default function AdminCompaniesPage() {
  const [rows, setRows] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE_URL}/admin/companies/report`,
          { method: "POST" }
        );
        const { statusCode, payload } = await parseApiResponse(res);
        if (statusCode >= 400) {
          setError(payload?.message || "Failed to load companies report.");
          setRows([]);
          return;
        }
        setRows(payload.companies || []);
      } catch (err) {
        console.error(err);
        setError("Network error: could not reach server.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page-shell--scroll">
      <div className="card-wide">
        <h1 className="card-title">Admin · Companies Report</h1>
        <p className="card-subtitle">
          Summary of all companies, their total jobs, and application activity.
        </p>

        {loading ? (
          <p>Loading…</p>
        ) : error ? (
          <p style={{ color: "#b91c1c" }}>{error}</p>
        ) : rows.length === 0 ? (
          <p>No companies found.</p>
        ) : (
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
                    Company
                  </th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>
                    Jobs
                  </th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>
                    Applications
                  </th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>
                    Hired
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.companyId}>
                    <td style={{ padding: "0.5rem", borderTop: "1px solid #e5e7eb" }}>
                      {c.companyName}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        textAlign: "right",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      {c.jobCount}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        textAlign: "right",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      {c.applicationCount}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        textAlign: "right",
                        borderTop: "1px solid #e5e7eb",
                      }}
                    >
                      {c.hiredCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}