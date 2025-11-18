"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Application = {
  jobId: number;
  title: string;
  company: string;
  location: string;
  skills: string;
  description: string;
  appliedAt: string;
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

export default function MyApplicationsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
    setError(null);
    setMessage(null);
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
    if (!email) {
      router.push("/applicant/login");
      return;
    }

    setMessage(null);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/applicants/jobs/withdraw`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, jobId }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);
      if (statusCode >= 400) {
        setError(payload?.message || "Could not withdraw application.");
        return;
      }

      setMessage(payload?.message || "Application withdrawn.");
      // Refresh list
      loadApplications(email);
    } catch (err) {
      console.error("handleWithdraw error:", err);
      setError("Network error: could not withdraw.");
    }
  };

  return (
    <div style={{ padding: "1rem", background: "#e0e0e0", minHeight: "100vh" }}>
      <button onClick={() => router.push("/applicant/home")}>
        ← Back to Home
      </button>

      <div
        style={{
          maxWidth: 700,
          margin: "1rem auto",
          background: "#f2f2f2",
          padding: "1rem",
          border: "1px solid #aaa",
        }}
      >
        <h2 style={{ textAlign: "center" }}>My Applications</h2>

        {loading ? (
          <p>Loading applications...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : applications.length === 0 ? (
          <p>You have not applied to any jobs yet.</p>
        ) : (
          <div>
            {applications.map((app) => (
              <div
                key={app.jobId}
                style={{
                  background: "#fff",
                  border: "1px solid #ccc",
                  padding: "0.7rem",
                  marginBottom: "0.5rem",
                }}
              >
                <strong>{app.title}</strong> <br />
                <span>{app.company}</span> <br />
                <small>{app.location}</small> <br />
                <small>Skills: {app.skills}</small> <br />
                <small>
                  Applied at:{" "}
                  {app.appliedAt
                    ? new Date(app.appliedAt).toLocaleString()
                    : ""}
                </small>
                <br />
                <button
                  onClick={() => handleWithdraw(app.jobId)}
                  style={{ marginTop: "0.4rem" }}
                >
                  Withdraw
                </button>
              </div>
            ))}
          </div>
        )}

        {message && <p style={{ color: "green", marginTop: "0.5rem" }}>{message}</p>}
      </div>
    </div>
  );
}
