"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type OfferDecision = "PENDING" | "ACCEPTED" | "REJECTED";

type Offer = {
  applicationId: number;
  jobId: number;
  title: string;
  company: string;
  location: string;
  skills: string;
  description: string;
  offerSentAt?: string;
  decision?: OfferDecision;
  decisionAt?: string;
};

// helper to normalize Lambda proxy responses
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

export default function ApplicantOffersPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // load email
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      router.push("/applicant/login");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  // load offers when email is known
  useEffect(() => {
    if (!email) return;
    loadOffers(email);
  }, [email]);

  async function loadOffers(userEmail: string) {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/applicants/offers/list`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to load offers.");
        setOffers([]);
      } else {
        setOffers(payload.offers || []);
      }
    } catch (err) {
      console.error("loadOffers error:", err);
      setError("Network error: could not reach server.");
    } finally {
      setLoading(false);
    }
  }

  // now takes jobId (not applicationId) because Lambda expects jobId
  async function handleDecision(
    jobId: number,
    decision: "ACCEPT" | "REJECT"
  ) {
    if (!email) return;
    setMessage("");
    setError("");

    const endpoint =
      decision === "ACCEPT"
        ? `${API_BASE_URL}/applicants/offers/accept`
        : `${API_BASE_URL}/applicants/offers/reject`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, jobId }), // 👈 FIX: send jobId
      });

      const outer = await res.json().catch(() => ({} as any));
      const { statusCode, payload } = parseLambdaResponse(outer, res);

      if (statusCode >= 400) {
        setError(payload?.message || "Could not update offer.");
        return;
      }

      setMessage(payload?.message || "Offer updated.");

      // refresh offers so UI reflects the new decision
      await loadOffers(email);
    } catch (err) {
      console.error("handleDecision error:", err);
      setError("Network error: could not update offer.");
    }
  }

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
        <h1 className="card-title">My Offers</h1>
        <p className="card-subtitle">
          Review job offers and choose to accept or reject.
        </p>

        {loading ? (
          <p>Loading offers…</p>
        ) : error ? (
          <p style={{ color: "#b91c1c" }}>{error}</p>
        ) : offers.length === 0 ? (
          <p>You don&apos;t have any offers yet.</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            {offers.map((offer) => {
              const isPending =
                !offer.decision || offer.decision === "PENDING";

              return (
                <div
                  key={offer.applicationId}
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
                      <strong>{offer.title}</strong>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#4b5563",
                        }}
                      >
                        {offer.company} · {offer.location}
                      </div>
                      {offer.offerSentAt && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#9ca3af",
                          }}
                        >
                          Offer sent:{" "}
                          {new Date(
                            offer.offerSentAt
                          ).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {isPending ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                        }}
                      >
                        <button
                          className="btn-primary"
                          style={{ width: "auto" }}
                          onClick={() =>
                            handleDecision(offer.jobId, "ACCEPT")
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ width: "auto" }}
                          onClick={() =>
                            handleDecision(offer.jobId, "REJECT")
                          }
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color:
                            offer.decision === "ACCEPTED"
                              ? "#166534"
                              : "#991b1b",
                          fontWeight: 600,
                        }}
                      >
                        You have{" "}
                        {offer.decision
                          ? offer.decision.toLowerCase()
                          : "responded to"}{" "}
                        this offer.
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#6b7280",
                    }}
                  >
                    Skills: {offer.skills}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#9ca3af",
                      marginTop: "0.25rem",
                    }}
                  >
                    {offer.description}
                  </div>
                </div>
              );
            })}
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
