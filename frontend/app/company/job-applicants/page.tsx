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
  offer_sent?: boolean; // optional backend-provided flag
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

// Your provided API endpoint for offers (single endpoint handling both send/rescind)
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

  // Track which applicants have offers (local state fallback if backend not used)
  const [offers, setOffers] = useState<Record<number, boolean>>({});
  // Track loading per-applicant for send/rescind action
  const [offerLoading, setOfferLoading] = useState<number | null>(null);
  // Track messages to show (optional)
  const [message, setMessage] = useState<string>("");

  // NEW: track "announce hiring decision" modal open/close
  const [announceModalOpen, setAnnounceModalOpen] = useState<boolean>(false);

  async function loadData(currentJobId: string): Promise<void> {
    try {
      const companyId = localStorage.getItem("company_id");

      // Load job details
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

      // Load applicants
      const appRes = await fetch(VIEW_APPLICANTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: Number(currentJobId) }),
      });
      const appData = await appRes.json();

      // Handle different response structures
      const applicantsList: Applicant[] =
        appData.applicants || appData.data || appData.applications || [];

      setApplicants(applicantsList);

      // Initialize offers map from backend-provided flag or status if present
      const initialOffers: Record<number, boolean> = {};
      for (const a of applicantsList) {
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

  // Helper to update a single applicant in state
  function updateApplicantInState(id: number, patch: Partial<Applicant>) {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
  }

  // Send offer handler
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
        // mark as sent locally and update applicant status to Offered
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

  // Rescind offer handler
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
        // mark rescinded locally and set a sensible default status (Pending)
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

    // Read job id from sessionStorage (set by the button that navigates here)
    const storedId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("view_job_id")
        : null;

    if (!storedId) {
      // If missing, send user back to jobs list
      router.push("/company/jobs");
      return;
    }

    setJobId(storedId);
    loadData(storedId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // NEW: persist applicants in localStorage so Job Details page can use them
  useEffect(() => {
    if (applicants.length === 0) return;
    try {
      localStorage.setItem("last_applicants", JSON.stringify(applicants));
    } catch (e) {
      console.error("Failed to store applicants for reporting", e);
    }
  }, [applicants]);

  // Pagination
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
        return { ...base, background: "#E0F2FE", color: "#075985" }; // offered badge style
      default:
        return { ...base, background: "#E5E7EB", color: "#374151" };
    }
  };

  const offeredCount = applicants.filter(
    (a) => (a.application_status || "").toLowerCase() === "offered"
  ).length;

  return (
    <div
      style={{ minHeight: "100vh", background: "#F3F4F6", padding: "32px 16px" }}
    >
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
            {/* NEW: Announce hiring decision */}
            

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
              {
                applicants.filter(
                  (a) => (a.application_status || "").toLowerCase() === "pending"
                ).length
              }
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
              {
                applicants.filter(
                  (a) => (a.application_status || "").toLowerCase() === "accepted"
                ).length
              }
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
              Accepted
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
                color: "#EF4444",
                margin: 0,
              }}
            >
              {
                applicants.filter(
                  (a) => (a.application_status || "").toLowerCase() === "rejected"
                ).length
              }
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
              Rejected
            </p>
          </div>
          {/* NEW: Offered stat */}
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
                color: "#0EA5E9",
                margin: 0,
              }}
            >
              {offeredCount}
            </p>
            <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>Offered</p>
          </div>
        </div>

        {/* Applicants List */}
        {applicants.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 48,
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ fontSize: 48, margin: 0 }}>📭</p>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#374151",
                marginTop: 16,
              }}
            >
              No Applicants Yet
            </h2>
            <p style={{ color: "#6B7280", marginTop: 8 }}>
              When candidates apply for this job, they will appear here.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1.5fr 1fr 1fr 1fr 200px",
                padding: "16px 20px",
                background: "#F9FAFB",
                borderBottom: "1px solid #E5E7EB",
                fontWeight: 600,
                fontSize: 13,
                color: "#6B7280",
                textTransform: "uppercase",
              }}
            >
              <span>Name</span>
              <span>Email</span>
              <span>Applied</span>
              <span>Status</span>
              <span>Rating</span>
              <span style={{ textAlign: "center" }}>Actions</span>
            </div>

            {/* Table Rows */}
            {paginatedApplicants.map((applicant, index) => {
              // consider applicant as having an offer if either local offers map says so OR their status is "offered"
              const offerSent =
                !!offers[applicant.id] ||
                (applicant.application_status || "").toLowerCase() === "offered";
              const isHirable =
                (applicant.rating || "").toLowerCase() ===
                "hirable".toLowerCase();

              return (
                <div
                  key={index}                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1.5fr 1fr 1fr 1fr 200px",
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
                  <span
                    style={getStatusBadge(
                      applicant.application_status || "pending"
                    )}
                  >
                    {applicant.application_status || "Pending"}
                  </span>
                  <div>
                    <select
                      value={applicant.rating ?? "Wait"}
                      onChange={(e) => {
                        const newRating = e.target.value;
                        // update local rating
                        setApplicants((prev) =>
                          prev.map((a) =>
                            a.id === applicant.id ? { ...a, rating: newRating } : a
                          )
                        );
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #E5E7EB",
                        background: "white",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#111827",
                        width: "100%",
                      }}
                    >
                      <option value="Wait">Wait</option>
                      <option value="Hirable">Hirable</option>
                      <option value="Unacceptable">Unacceptable</option>
                    </select>
                  </div>

                  {/* Actions column: Send Offer / Rescind Offer */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {/* Send Offer: only show when Hirable && not already sent */}
                    {!offerSent && isHirable && (
                      <button
                        onClick={() => sendOffer(applicant)}
                        disabled={offerLoading === applicant.id}
                        style={{
                          padding: "8px 12px",
                          background:
                            offerLoading === applicant.id
                              ? "#E5E7EB"
                              : "#10B981",
                          color:
                            offerLoading === applicant.id
                              ? "#9CA3AF"
                              : "white",
                          borderRadius: 8,
                          border: "none",
                          cursor:
                            offerLoading === applicant.id
                              ? "not-allowed"
                              : "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {offerLoading === applicant.id
                          ? "Sending..."
                          : "Send Offer"}
                      </button>
                    )}

                    {/* Rescind Offer: show when offerSent OR application_status is OFFERED */}
                    {offerSent && (
                      <button
                        onClick={() => rescindOffer(applicant)}
                        disabled={offerLoading === applicant.id}
                        style={{
                          padding: "8px 12px",
                          background:
                            offerLoading === applicant.id
                              ? "#E5E7EB"
                              : "#EF4444",
                          color:
                            offerLoading === applicant.id
                              ? "#9CA3AF"
                              : "white",
                          borderRadius: 8,
                          border: "none",
                          cursor:
                            offerLoading === applicant.id
                              ? "not-allowed"
                              : "pointer",
                          fontWeight: 600,
                        }}
                      >
                        {offerLoading === applicant.id
                          ? "Processing..."
                          : "Rescind Offer"}
                      </button>
                    )}

                    {/* If not hirable and not sent, show disabled placeholder so layout doesn't shift */}
                    {!offerSent && !isHirable && (
                      <button
                        disabled
                        style={{
                          padding: "8px 12px",
                          background: "#E5E7EB",
                          color: "#9CA3AF",
                          borderRadius: 8,
                          border: "none",
                          cursor: "not-allowed",
                          fontWeight: 600,
                        }}
                      >
                        No Action
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                  padding: 20,
                  borderTop: "1px solid #E5E7EB",
                }}
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: "8px 16px",
                    background: page === 1 ? "#E5E7EB" : "#2563EB",
                    color: page === 1 ? "#9CA3AF" : "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    fontWeight: 500,
                  }}
                >
                  ← Previous
                </button>
                <span
                  style={{
                    padding: "0 16px",
                    color: "#6B7280",
                    fontSize: 14,
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: "8px 16px",
                    background:
                      page === totalPages ? "#E5E7EB" : "#2563EB",
                    color:
                      page === totalPages ? "#9CA3AF" : "white",
                    border: "none",
                    borderRadius: 6,
                    cursor:
                      page === totalPages ? "not-allowed" : "pointer",
                    fontWeight: 500,
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEW: Announce hiring decision modal */}
      {announceModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              maxWidth: 420,
              width: "90%",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
                color: "#111827",
              }}
            >
              Announce hiring decision?
            </h2>
            <p style={{ color: "#6B7280", marginBottom: 16 }}>
              This will finalize your hiring decision for all candidates with{" "}
              <strong>Offered</strong> status. No backend call is made yet,
              this is a frontend-only confirmation for now.
            </p>

            <p
              style={{
                fontSize: 14,
                color: "#4B5563",
                marginBottom: 12,
              }}
            >
              Currently{" "}
              <strong>{offeredCount}</strong> applicant
              {offeredCount === 1 ? "" : "s"} marked as{" "}
              <span style={{ color: "#0EA5E9", fontWeight: 600 }}>
                Offered
              </span>
              .
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 8,
              }}
            >
              <button
                onClick={() => setAnnounceModalOpen(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#E5E7EB",
                  color: "#374151",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(
                    `Hiring decision announced for ${offeredCount} offered applicant(s). (Frontend only for now)`
                  );
                  setAnnounceModalOpen(false);
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#10B981",
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
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
      <p style={{ marginTop: 16, color: "#6B7280" }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function JobApplicantsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <JobApplicantsContent />
    </Suspense>
  );
}
