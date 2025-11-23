"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Application = {
  jobId: number;
  title: string;
  company: string;
  location: string;
  skills: string;
  description: string;
  appliedAt?: string;
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

export default function MyApplicationsPage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      router.push("/applicant/login");
      return;
    }
    setEmail(storedEmail);
    loadApplications(storedEmail);
  }, [router]);

  const loadApplications = async (userEmail: string) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/applicants/jobs/applications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to load applications.");
        setApplications([]);
        setLoading(false);
        return;
      }

      setApplications(payload.applications || []);
    } catch (err) {
      console.error("loadApplications error:", err);
      setError("Network error: could not reach server.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (jobId: number) => {
    if (!email) return;
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/applicants/jobs/withdraw`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, jobId }),
        }
      );

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setError(payload?.message || "Could not withdraw application.");
        return;
      }

      setMessage(payload?.message || "Application withdrawn.");
      loadApplications(email);
    } catch (err) {
      console.error("withdraw error:", err);
      setError("Network error: could not withdraw.");
    }
  };

  return (
    <div className="page-shell--scroll">
      <div style={{ maxWidth: "960px", margin: "0 auto 0.75rem" }}>
        <button
          onClick={() => router.push("/applicant/home")}
          className="btn-link"
        >
          ← Back to Home
        </button>
      </div>

      <div className="card-wide">
        <h1 className="card-title">My Applications</h1>
        <p className="card-subtitle">
          Review the jobs you&apos;ve applied to and withdraw if needed.
        </p>

        {loading ? (
          <p>Loading applications…</p>
        ) : error ? (
          <p style={{ color: "#b91c1c" }}>{error}</p>
        ) : applications.length === 0 ? (
          <p>You haven&apos;t applied to any jobs yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {applications.map((app) => (
              <div
                key={app.jobId}
                className="section-box"
                style={{ backgroundColor: "#f9fafb" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.25rem",
                  }}
                >
                  <div>
                    <strong>{app.title}</strong>
                    <div
                      style={{ fontSize: "0.85rem", color: "#4b5563" }}
                    >
                      {app.company} · {app.location}
                    </div>
                    {app.appliedAt && (
                      <div
                        style={{ fontSize: "0.75rem", color: "#9ca3af" }}
                      >
                        Applied at:{" "}
                        {new Date(app.appliedAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn-secondary"
                    style={{ width: "auto" }}
                    onClick={() => handleWithdraw(app.jobId)}
                  >
                    Withdraw
                  </button>
                </div>

                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  Skills: {app.skills}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#9ca3af",
                    marginTop: "0.25rem",
                  }}
                >
                  {app.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {message && (
          <p
            style={{
              color: "#166534",
              fontSize: "0.9rem",
              marginTop: "0.75rem",
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}