"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  skills: string;
  experience: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Handles both:
 * 1) Lambda proxy: { statusCode, headers, body: '{"profile":{...}}' }
 * 2) Normal JSON:  { profile: {...} }
 */
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

/** Normalizes whatever the Lambda returns into our Profile shape */
function normalizeProfile(payload: any, fallbackEmail: string): Profile {
  // Some common patterns:
  // { profile: {...} }, { userProfile: {...} }, { data: {...} }, or payload itself
  const src =
    payload?.profile ??
    payload?.userProfile ??
    payload?.data ??
    payload;

  if (!src || typeof src !== "object") {
    return {
      firstName: "",
      lastName: "",
      email: fallbackEmail,
      phone: "",
      skills: "",
      experience: "",
    };
  }

  return {
    firstName: src.firstName ?? src.first_name ?? "",
    lastName: src.lastName ?? src.last_name ?? "",
    email: src.email ?? fallbackEmail,
    phone: src.phone ?? "",
    skills: src.skills ?? src.skills_summary ?? "",
    experience: src.experience ?? src.experience_summary ?? "",
  };
}

export default function ProfilePage() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    skills: "",
    experience: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load email from localStorage and fetch profile
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      router.push("/applicant/login");
      return;
    }
    setEmail(storedEmail);
    void loadProfile(storedEmail);
  }, [router]);

  const loadProfile = async (userEmail: string) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/applicants/profile/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const { statusCode, payload } = await parseApiResponse(res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to load profile.");
        setLoading(false);
        return;
      }

      const normalized = normalizeProfile(payload, userEmail);

      // If backend truly returned nothing, keep email & show message
      if (
        !normalized.firstName &&
        !normalized.lastName &&
        !normalized.phone &&
        !normalized.skills &&
        !normalized.experience
      ) {
        setMessage(
          "No profile information found yet. Use Edit Profile to add your details."
        );
      }

      setProfile(normalized);
    } catch (err) {
      console.error("loadProfile error:", err);
      setError("Network error: could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!email) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      // Send BOTH camelCase and snake_case keys so we don't depend
      // on one specific Lambda implementation.
      const body = {
        email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        skills: profile.skills,
        experience: profile.experience,

        // snake_case fallbacks for older Lambda code
        first_name: profile.firstName,
        last_name: profile.lastName,
        skills_summary: profile.skills,
        experience_summary: profile.experience,
      };

      const res = await fetch(`${API_BASE_URL}/applicants/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const { statusCode, payload } = await parseApiResponse(res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to save profile.");
        setSaving(false);
        return;
      }

      setMessage(payload?.message || "Profile updated successfully.");
      setIsEditing(false);

      // Re-fetch from DB so preview always shows persisted data
      await loadProfile(email);
    } catch (err) {
      console.error("saveProfile error:", err);
      setError("Network error: could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange =
    (field: keyof Profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfile((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto 0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => router.push("/applicant/home")}
          style={{
            border: "none",
            background: "none",
            color: "#2563eb",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          ← Back to Home
        </button>
      </div>

      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 18px 40px rgba(15,23,42,0.15)",
          padding: "2.5rem 3rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Profile
        </h1>
        <p
          style={{
            color: "#6b7280",
            fontSize: "1rem",
            marginBottom: "2rem",
          }}
        >
          Review your details. Click &quot;Edit Profile&quot; to make changes.
        </p>

        {loading ? (
          <p>Loading profile…</p>
        ) : (
          <>
            {/* Basic Information */}
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid #e5e7eb",
                padding: "1.5rem",
                marginBottom: "1.25rem",
                backgroundColor: "#f9fafb",
              }}
            >
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                }}
              >
                Basic Information
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: "0.75rem",
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      marginBottom: "0.25rem",
                      fontWeight: 500,
                    }}
                  >
                    First Name
                  </label>
                  <input
                    className="input"
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #d1d5db",
                    }}
                    value={profile.firstName}
                    onChange={handleChange("firstName")}
                    readOnly={!isEditing}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      marginBottom: "0.25rem",
                      fontWeight: 500,
                    }}
                  >
                    Last Name
                  </label>
                  <input
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #d1d5db",
                    }}
                    value={profile.lastName}
                    onChange={handleChange("lastName")}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div style={{ marginTop: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "0.25rem",
                    fontWeight: 500,
                  }}
                >
                  Email
                </label>
                <input
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.9rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#e5e7eb",
                  }}
                  value={profile.email}
                  readOnly
                />
              </div>

              <div style={{ marginTop: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "0.25rem",
                    fontWeight: 500,
                  }}
                >
                  Phone
                </label>
                <input
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.9rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #d1d5db",
                  }}
                  value={profile.phone}
                  onChange={handleChange("phone")}
                  readOnly={!isEditing}
                />
              </div>
            </div>

            {/* Skills and Expertise */}
            <div
              style={{
                borderRadius: "18px",
                border: "1px solid #e5e7eb",
                padding: "1.5rem",
                marginBottom: "1.25rem",
                backgroundColor: "#f9fafb",
              }}
            >
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                }}
              >
                Skills and Expertise
              </h2>

              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "0.25rem",
                    fontWeight: 500,
                  }}
                >
                  Your Skills
                </label>
                <textarea
                  style={{
                    width: "100%",
                    minHeight: "90px",
                    padding: "0.7rem 0.9rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #d1d5db",
                    resize: "vertical",
                  }}
                  value={profile.skills}
                  onChange={handleChange("skills")}
                  readOnly={!isEditing}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    marginBottom: "0.25rem",
                    fontWeight: 500,
                  }}
                >
                  Experience
                </label>
                <textarea
                  style={{
                    width: "100%",
                    minHeight: "90px",
                    padding: "0.7rem 0.9rem",
                    borderRadius: "0.75rem",
                    border: "1px solid #d1d5db",
                    resize: "vertical",
                  }}
                  value={profile.experience}
                  onChange={handleChange("experience")}
                  readOnly={!isEditing}
                />
              </div>
            </div>

            {error && (
              <p
                style={{
                  color: "#b91c1c",
                  fontSize: "0.9rem",
                  marginBottom: "0.75rem",
                }}
              >
                {error}
              </p>
            )}
            {message && (
              <p
                style={{
                  color: "#166534",
                  fontSize: "0.9rem",
                  marginBottom: "0.75rem",
                }}
              >
                {message}
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
              }}
            >
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (email) void loadProfile(email);
                    }}
                    style={{
                      padding: "0.7rem 1.1rem",
                      borderRadius: "9999px",
                      border: "none",
                      backgroundColor: "#e5e7eb",
                      color: "#374151",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: "0.7rem 1.4rem",
                      borderRadius: "9999px",
                      border: "none",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      cursor: saving ? "default" : "pointer",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                    }}
                  >
                    {saving ? "Saving…" : "Save Profile"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: "0.7rem 1.4rem",
                    borderRadius: "9999px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}