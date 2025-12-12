"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const [rows, setRows] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ AUTH GUARD
  useEffect(() => {
    if (typeof window === "undefined") return;
    const adminEmail = localStorage.getItem("admin_email");
    if (!adminEmail) router.push("/admin/login");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_name");
    router.push("/admin/login");
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/admin/companies/report`, {
          method: "POST",
        });

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
      {/* ✅ top nav */}
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto 0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <button onClick={() => router.push("/admin/home")} className="btn-link">
          ← Back to Admin Dashboard
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 16px",
            borderRadius: "9999px",
            border: "1px solid #FED7AA",
            background: "#FFF7ED",
            fontSize: "14px",
            color: "#9A3412",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Log Out
        </button>
      </div>

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
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Company</th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>Jobs</th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>Applications</th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>Hired</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.companyId}>
                    <td style={{ padding: "0.5rem", borderTop: "1px solid #e5e7eb" }}>
                      {c.companyName}
                    </td>
                    <td style={{ padding: "0.5rem", textAlign: "right", borderTop: "1px solid #e5e7eb" }}>
                      {c.jobCount}
                    </td>
                    <td style={{ padding: "0.5rem", textAlign: "right", borderTop: "1px solid #e5e7eb" }}>
                      {c.applicationCount}
                    </td>
                    <td style={{ padding: "0.5rem", textAlign: "right", borderTop: "1px solid #e5e7eb" }}>
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
