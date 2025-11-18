"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  skills: string;
  experience: string;
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
    statusCode: typeof raw.statusCode === "number" ? raw.statusCode : res.status,
    payload: inner,
  };
}

const emptyProfile: Profile = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  skills: "",
  experience: "",
};

export default function ApplicantProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [originalProfile, setOriginalProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      router.push("/applicant/login");
      return;
    }
    loadProfile(storedEmail);
  }, [router]);

  const loadProfile = async (email: string) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/applicants/profile/get`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to load profile.");
        setLoading(false);
        return;
      }

      const data: Profile = {
        email: payload.email || email,
        firstName: payload.firstName || "",
        lastName: payload.lastName || "",
        phone: payload.phone || "",
        skills: payload.skills || "",
        experience: payload.experience || "",
      };

      setProfile(data);
      setOriginalProfile(data);
    } catch (err) {
      console.error(err);
      setError("Network error: could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/applicants/profile/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        }
      );

      const { statusCode, payload } = await parseApiResponse(res);

      if (statusCode >= 400) {
        setError(payload?.message || "Failed to update profile.");
        setSaving(false);
        return;
      }

      setMessage(payload?.message || "Profile updated successfully.");
      setOriginalProfile(profile);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError("Network error: could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setEditMode(false);
    setError(null);
    setMessage(null);
  };

  const handleChange = (field: keyof Profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading profile...</div>;
  }

  return (
    <div style={{ padding: "1rem", background: "#e0e0e0", minHeight: "100vh" }}>
      <button onClick={() => router.push("/applicant/home")}>← Back to Home</button>

      <div style={{ maxWidth: 600, margin: "1rem auto", background: "#f2f2f2", padding: "1rem", border: "1px solid #aaa" }}>
        <h2 style={{ textAlign: "center" }}>PROFILE</h2>

        {/* Basic Information */}
        <section style={{ marginTop: "1rem", border: "1px solid #aaa", padding: "0.8rem", background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>Basic Information</h3>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>First Name:</label>
            <br />
            <input
              type="text"
              value={profile.firstName}
              disabled={!editMode}
              onChange={e => handleChange("firstName", e.target.value)}
              style={{ width: "100%", padding: "0.4rem" }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Last Name:</label>
            <br />
            <input
              type="text"
              value={profile.lastName}
              disabled={!editMode}
              onChange={e => handleChange("lastName", e.target.value)}
              style={{ width: "100%", padding: "0.4rem" }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Email:</label>
            <br />
            <input
              type="email"
              value={profile.email}
              disabled
              style={{ width: "100%", padding: "0.4rem", background: "#ddd" }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Phone:</label>
            <br />
            <input
              type="text"
              value={profile.phone}
              disabled={!editMode}
              onChange={e => handleChange("phone", e.target.value)}
              style={{ width: "100%", padding: "0.4rem" }}
            />
          </div>
        </section>

        {/* Skills and Expertise */}
        <section style={{ marginTop: "1rem", border: "1px solid #aaa", padding: "0.8rem", background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>Skills and Expertise</h3>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Your Skills:</label>
            <br />
            <textarea
              value={profile.skills}
              disabled={!editMode}
              onChange={e => handleChange("skills", e.target.value)}
              style={{ width: "100%", padding: "0.4rem", minHeight: "60px" }}
            />
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>Experience:</label>
            <br />
            <textarea
              value={profile.experience}
              disabled={!editMode}
              onChange={e => handleChange("experience", e.target.value)}
              style={{ width: "100%", padding: "0.4rem", minHeight: "60px" }}
            />
          </div>
        </section>

        {error && <p style={{ color: "red", marginTop: "0.5rem" }}>{error}</p>}
        {message && <p style={{ color: "green", marginTop: "0.5rem" }}>{message}</p>}

        {/* Buttons */}
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          {!editMode ? (
            <button onClick={() => setEditMode(true)}>Edit Profile</button>
          ) : (
            <>
              <button onClick={handleCancel} disabled={saving}>Cancel</button>
              <button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
