"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Applicant {
  id: number;
  user_id?: number;
  rating?: string;
  user_name?: string;
  user_email?: string;
  name?: string;
  email?: string;
  applicant_name?: string;
  applicant_email?: string;
  application_status: string;
  applied_at?: string;
  application_date?: string;
  created_at?: string;
  resume_url?: string;
  offer_sent?: boolean;
}

interface Job {
  id: number;
  job_name: string;
  job_status: string;
}

const GET_JOB_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/getjobdetails";
const VIEW_APPLICANTS_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/viewapplicants";
const UPDATE_RATING_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/updateApplicantRating";
const OFFER_API_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/offerjob";

function JobApplicantsContent() {
  const router = useRouter();

  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [page, setPage] = useState<number>(1);
  const perPage = 10;

  const [offers, setOffers] = useState<Record<number, boolean>>({});
  const [offerLoading, setOfferLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");

  function ratingsStorageKey(jid: string | number) {
    return `applicant_ratings_${jid}`;
  }

  function loadSavedRatings(jid: string | number) {
    try {
      const raw = localStorage.getItem(ratingsStorageKey(jid));
      if (!raw) return {} as Record<number, string>;
      return JSON.parse(raw) as Record<number, string>;
    } catch (e) {
      console.error("Failed to read saved ratings:", e);
      return {} as Record<number, string>;
    }
  }

  function saveRatingsMap(jid: string | number, map: Record<number, string>) {
    try {
      localStorage.setItem(ratingsStorageKey(jid), JSON.stringify(map));
    } catch (e) {
      console.error("Failed to save ratings map:", e);
    }
  }

  async function loadData(currentJobId: string): Promise<void> {
    try {
      const companyId = localStorage.getItem("company_id");

      const jobRes = await fetch(GET_JOB_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: Number(companyId) }),
      });
      const jobData = await jobRes.json();
      const foundJob = (jobData.jobs || []).find(
        (j: Job) => j.id === Number(currentJobId)
      );
      setJob(foundJob || null);

      const appRes = await fetch(VIEW_APPLICANTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: Number(currentJobId) }),
      });
      const appData = await appRes.json();
      const applicantsList: Applicant[] =
        appData.applicants || appData.data || appData.applications || [];

      const savedRatings = loadSavedRatings(currentJobId);
      const mergedApplicants = applicantsList.map((a: Applicant) => {
        if (savedRatings && savedRatings[a.id]) {
          return { ...a, rating: savedRatings[a.id] };
        }
        return a;
      });

      setApplicants(mergedApplicants);

      const initialOffers: Record<number, boolean> = {};
      for (const a of mergedApplicants) {
        initialOffers[a.id] =
          !!a.offer_sent ||
          (a.application_status || "").toLowerCase() === "offered";
      }
      setOffers(initialOffers);
    } catch (err) {
      console.error("Error loading data:", err);
      setMessage("Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  }

  function updateApplicantInState(id: number, patch: Partial<Applicant>) {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  }

  async function updateApplicantRating(
    applicantId: number,
    newRating: string
  ): Promise<void> {
    if (!jobId) return;

    updateApplicantInState(applicantId, { rating: newRating });
    const key = jobId;
    const map = loadSavedRatings(key);
    map[applicantId] = newRating;
    saveRatingsMap(key, map);

    try {
      const companyId = localStorage.getItem("company_id");
      const body = {
        job_id: Number(jobId),
        applicant_id: Number(applicantId),
        rating: newRating,
        company_id: companyId ? Number(companyId) : undefined,
      };

      const res = await fetch(UPDATE_RATING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const out = await res.json().catch(() => ({}));
        const errMsg =
          out?.error ||
          out?.message ||
          `Failed to persist rating (status ${res.status})`;
        setMessage(errMsg);
      } else {
        const out = await res.json().catch(() => ({}));
        if (out && out.updatedApplicant) {
          updateApplicantInState(applicantId, out.updatedApplicant);
        }
        setMessage("");
      }
    } catch (err) {
      console.error("updateApplicantRating error:", err);
      setMessage("Network error while saving rating. Saved locally.");
    }
  }

  async function sendOffer(applicant: Applicant) {
    const id = applicant.id;
    setOfferLoading(id);
    setMessage("");

    try {
      const companyId = localStorage.getItem("company_id");
      const body = {
        action: "send",
        job_id: Number(jobId),
        applicant_id: id,
        user_email:
          applicant.user_email || applicant.email || applicant.applicant_email,
        company_id: companyId ? Number(companyId) : undefined,
      };

      const res = await fetch(OFFER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = out.error || "Failed to send offer";
        setMessage(errMsg);
      } else {
        setOffers((prev) => ({ ...prev, [id]: true }));
        updateApplicantInState(id, {
          offer_sent: true,
          application_status: "Offered",
        });
        setMessage(out.message || "Offer sent.");
      }
    } catch (err) {
      console.error("sendOffer error:", err);
      setMessage("Network error while sending offer.");
    } finally {
      setOfferLoading(null);
    }
  }

  async function rescindOffer(applicant: Applicant) {
    const id = applicant.id;
    setOfferLoading(id);
    setMessage("");

    try {
      const companyId = localStorage.getItem("company_id");
      const body = {
        action: "rescind",
        job_id: Number(jobId),
        applicant_id: id,
        user_email:
          applicant.user_email || applicant.email || applicant.applicant_email,
        company_id: companyId ? Number(companyId) : undefined,
      };

      const res = await fetch(OFFER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = out.error || "Failed to rescind offer";
        setMessage(errMsg);
      } else {
        setOffers((prev) => ({ ...prev, [id]: false }));
        updateApplicantInState(id, {
          offer_sent: false,
          application_status: "Pending",
        });
        setMessage(out.message || "Offer rescinded.");
      }
    } catch (err) {
      console.error("rescindOffer error:", err);
      setMessage("Network error while rescinding offer.");
    } finally {
      setOfferLoading(null);
    }
  }

  useEffect(() => {
    const companyId = localStorage.getItem("company_id");
    if (!companyId) {
      router.push("/company/login");
      return;
    }

    const storedId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("view_job_id")
        : null;

    if (!storedId) {
      router.push("/company/jobs");
      return;
    }

    setJobId(storedId);
    loadData(storedId);
  }, []);

  useEffect(() => {
    if (applicants.length === 0 || !jobId) return;
    try {
      localStorage.setItem("last_applicants", JSON.stringify(applicants));
    } catch (e) {
      console.error("Failed to store applicants for reporting", e);
    }
  }, [applicants, jobId]);

  const totalPages = Math.max(1, Math.ceil(applicants.length / perPage));
  const paginatedApplicants = applicants.slice(
    (page - 1) * perPage,
    page * perPage
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F3F4F6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "4px solid #E5E7EB",
            borderTopColor: "#2563EB",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ marginTop: 16, color: "#6B7280" }}>Loading applicants...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ minHeight: "100vh", background: "#F3F4F6", padding: 32 }}>
        <div
          style={{
            maxWidth: 500,
            margin: "0 auto",
            background: "white",
            borderRadius: 12,
            padding: 32,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#DC2626",
              marginBottom: 16,
            }}
          >
            Job Not Found
          </h1>
          <p style={{ color: "#6B7280", marginBottom: 24 }}>
            The job you&apos;re looking for doesn&apos;t exist or you don&apos;t
            have access.
          </p>
          <Link
            href="/company/jobs"
            style={{
              padding: "10px 20px",
              background: "#2563EB",
              color: "white",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: "4px 10px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      textTransform: "capitalize",
    };
    switch (status?.toLowerCase()) {
      case "pending":
        return { ...base, background: "#FEF3C7", color: "#92400E" };
      case "reviewed":
        return { ...base, background: "#DBEAFE", color: "#1E40AF" };
      case "accepted":
        return { ...base, background: "#D1FAE5", color: "#065F46" };
      case "rejected":
        return { ...base, background: "#FEE2E2", color: "#991B1B" };
      case "offered":
        return { ...base, background: "#E0F2FE", color: "#075985" };
      case "hired":
        return { ...base, background: "#D1FAE5", color: "#065F46" };
      default:
        return { ...base, background: "#E5E7EB", color: "#374151" };
    }
  };

  const offeredCount = applicants.filter(
    (a) => (a.application_status || "").toLowerCase() === "offered"
  ).length;

  return (
    <div style={{ minHeight: "100vh", background: "#F3F4F6", padding: "32px 16px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              👥 Applicants
            </h1>
            <p style={{ color: "#6B7280", marginTop: 4 }}>
              for{" "}
              <span style={{ fontWeight: 600, color: "#2563EB" }}>
                {job.job_name}
              </span>
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => {
                if (jobId) {
                  sessionStorage.setItem("view_job_id", String(jobId));
                  router.push("/company/job-details");
                }
              }}
              style={{
                padding: "10px 20px",
                background: "white",
                color: "#374151",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 500,
                fontSize: 14,
                border: "1px solid #D1D5DB",
                cursor: "pointer",
              }}
            >
              📋 View Job
            </button>
            <Link
              href="/company/jobs"
              style={{
                padding: "10px 20px",
                background: "#E5E7EB",
                color: "#374151",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              ← Back to Jobs
            </Link>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              borderRadius: 8,
              background: "#FEF3C7",
              color: "#92400E",
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        )}

        {/* Stats Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#2563EB",
                margin: 0,
              }}
            >
              {applicants.length}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
              Total Applicants
            </p>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#F59E0B",
                margin: 0,
              }}
            >
              {applicants.filter(
                (a) => (a.application_status || "").toLowerCase() === "pending"
              ).length}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Pending</p>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#10B981",
                margin: 0,
              }}
            >
              {applicants.filter(
                (a) => (a.application_status || "").toLowerCase() === "accepted"
              ).length}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Accepted</p>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#EF4444",
                margin: 0,
              }}
            >
              {applicants.filter(
                (a) => (a.application_status || "").toLowerCase() === "rejected"
              ).length}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Rejected</p>
          </div>
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 12,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#2563EB",
                margin: 0,
              }}
            >
              {offeredCount}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Offered</p>
          </div>
        </div>

        {/* Applicants Table */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 0,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          }}
        >
          {paginatedApplicants.map((applicant) => {
            const offerSent =
              !!offers[applicant.id] ||
              (applicant.application_status || "").toLowerCase() === "offered";
            const isHirable =
              (applicant.rating || "").toLowerCase() === "hirable".toLowerCase();

            const statusUpper = (applicant.application_status || "").toUpperCase();
            const disableInputs = statusUpper === "HIRED" || statusUpper === "REJECTED";

            return (
              <div
                key={applicant.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 200px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #F3F4F6",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontWeight: 600, color: "#111827" }}>
                  {applicant.user_name ||
                    applicant.name ||
                    applicant.applicant_name ||
                    "N/A"}
                </span>
                <span style={{ color: "#6B7280", fontSize: 14 }}>
                  {applicant.user_email ||
                    applicant.email ||
                    applicant.applicant_email ||
                    "N/A"}
                </span>
                <span style={{ color: "#6B7280", fontSize: 14 }}>
                  {applicant.applied_at ||
                  applicant.application_date ||
                  applicant.created_at
                    ? new Date(
                        applicant.applied_at ||
                          applicant.application_date ||
                          applicant.created_at ||
                          ""
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
                <span style={getStatusBadge(applicant.application_status || "pending")}>
                  {applicant.application_status || "Pending"}
                </span>

                {/* Rating Dropdown */}
                <div>
                  <select
                    value={applicant.rating ?? "Wait"}
                    disabled={disableInputs}
                    onChange={(e) => {
                      if (!disableInputs) {
                        updateApplicantRating(applicant.id, e.target.value);
                      }
                    }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      background: disableInputs ? "#F3F4F6" : "white",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#111827",
                      width: "100%",
                      cursor: disableInputs ? "not-allowed" : "pointer",
                    }}
                  >
                    <option value="Wait">Wait</option>
                    <option value="Hirable">Hirable</option>
                    <option value="Unacceptable">Unacceptable</option>
                  </select>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  <button
                    onClick={() => sendOffer(applicant)}
                    disabled={offerSent || disableInputs || offerLoading === applicant.id || !isHirable}
                    style={{
                      padding: "8px 12px",
                      background:
                        offerSent || disableInputs || !isHirable ? "#E5E7EB" : "#10B981",
                      color: offerSent || disableInputs || !isHirable ? "#9CA3AF" : "white",
                      borderRadius: 8,
                      border: "none",
                      cursor:
                        offerSent || disableInputs || !isHirable
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {offerLoading === applicant.id ? "Sending..." : "Send Offer"}
                  </button>

                  <button
                    onClick={() => rescindOffer(applicant)}
                    disabled={!offerSent || disableInputs || offerLoading === applicant.id}
                    style={{
                      padding: "8px 12px",
                      background: !offerSent || disableInputs ? "#E5E7EB" : "#EF4444",
                      color: !offerSent || disableInputs ? "#9CA3AF" : "white",
                      borderRadius: 8,
                      border: "none",
                      cursor: !offerSent || disableInputs ? "not-allowed" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {offerLoading === applicant.id ? "Processing..." : "Rescind Offer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: 24, display: "flex", gap: 8, justifyContent: "center" }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #D1D5DB",
                  background: page === i + 1 ? "#2563EB" : "white",
                  color: page === i + 1 ? "white" : "#374151",
                  cursor: "pointer",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobApplicantsContent;
