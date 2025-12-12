"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApplicantRow = {
  userId: number;
  email: string;
  appliedCount: number;
  withdrawnCount: number;
  totalApplications?: number;
  activeApplications?: number;
  offers?: number;
  hired?: number;
};

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

export default function AdminApplicantsPage() {
  const router = useRouter();

  const [rows, setRows] = useState<ApplicantRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ AUTH GUARD
  useEffect(() => {
    if (typeof window === "undefined") return;
    const adminEmail = localStorage.getItem("admin_email");
    if (!adminEmail) router.push("/admin/login");
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_email");
      localStorage.removeItem("admin_id");
      localStorage.removeItem("admin_name");
    }
    router.push("/admin/login");
  };

  const loadPage = async (p: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/applicants/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: p, pageSize: 20 }),
      });

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to load applicants report.");
        setRows([]);
        return;
      }

      setRows(payload.applicants || []);
      setPage(payload.page || p);
      setTotalPages(payload.totalPages || 1);
    } catch (err) {
      console.error("Admin applicants network error:", err);
      setError("Network error: could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) return;
    loadPage(next);
  };

  const renderPageButtons = () => {
    const buttons = [];
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={i === page ? "is-active" : ""}
          style={{
            minWidth: 28,
            height: 28,
            borderRadius: 999,
            border: "1px solid #E5E7EB",
            fontSize: "0.8rem",
            marginInline: 2,
            backgroundColor: i === page ? "#2563eb" : "#ffffff",
            color: i === page ? "#ffffff" : "#111827",
            cursor: "pointer",
          }}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

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
        <h1 className="card-title">Applicants Report (Admin)</h1>
        <p className="card-subtitle">
          Each applicant with the number of jobs they have applied to and withdrawn from.
        </p>

        {loading ? (
          <p>Loading applicants…</p>
        ) : error ? (
          <p style={{ color: "#b91c1c" }}>{error}</p>
        ) : rows.length === 0 ? (
          <p>No applicants found.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1rem",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Email</th>
                <th style={{ padding: "0.5rem" }}># Applied</th>
                <th style={{ padding: "0.5rem" }}># Withdrawn</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.5rem" }}>{r.email}</td>
                  <td style={{ padding: "0.5rem" }}>{r.appliedCount}</td>
                  <td style={{ padding: "0.5rem" }}>{r.withdrawnCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* pagination */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "center",
            gap: "0.25rem",
          }}
        >
          <button
            onClick={() => handlePageChange(page - 1)}
            style={{
              minWidth: 28,
              height: 28,
              borderRadius: 999,
              border: "1px solid #E5E7EB",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            ←
          </button>
          {renderPageButtons()}
          <button
            onClick={() => handlePageChange(page + 1)}
            style={{
              minWidth: 28,
              height: 28,
              borderRadius: 999,
              border: "1px solid #E5E7EB",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
