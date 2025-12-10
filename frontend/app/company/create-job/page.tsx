"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_CREATE_JOB_URL ||
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/createjob";

export default function CreateJobPage() {
  const router = useRouter();

  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobType, setJobType] = useState("Full-Time");
  const [workMode, setWorkMode] = useState("Onsite");
  const [jobStatus, setJobStatus] = useState("Active");
  const [skills, setSkills] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function mapJobType(type: string) {
    return type === "Full-Time"
      ? "fulltime"
      : type === "Part-Time"
      ? "part-time"
      : type === "Internship"
      ? "internship"
      : "contract";
  }

  function mapWorkMode(mode: string) {
    return mode === "Onsite"
      ? "onsite"
      : mode === "Remote"
      ? "remote"
      : "hybrid";
  }

  function mapStatus(status: string) {
    return status === "Active" ? "active" : "inactive";
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const company_id =
      typeof window !== "undefined"
        ? localStorage.getItem("company_id")
        : null;

    if (!company_id) {
      setMessage("Company ID missing. Please log in again.");
      return;
    }

    const payload = {
      company_id,
      job_name: jobName,
      job_description: jobDescription,
      skills,
      salary,
      location,
      job_type: mapJobType(jobType),
      work_mode: mapWorkMode(workMode),
      job_status: mapStatus(jobStatus)
    };

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Job created successfully!");

        setTimeout(() => {
          router.push("/company/dashboard");
        }, 1200);
      } else {
        setMessage(data.error || "Failed to create job");
      }
    } catch (err) {
      setMessage("Network error: " + (err instanceof Error ? err.message : "Unknown error"));
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        background: "#fff",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Create Job Posting</h1>

      <form onSubmit={handleSubmit}>
        <label>Job Title *</label>
        <input
          type="text"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          style={inputStyle}
        />

        <label>Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          style={{ ...inputStyle, height: 100 }}
        />

        <label>Job Type</label>
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          style={inputStyle}
        >
          <option>Full-Time</option>
          <option>Part-Time</option>
          <option>Internship</option>
          <option>Contract</option>
        </select>

        <label>Work Mode</label>
        <select
          value={workMode}
          onChange={(e) => setWorkMode(e.target.value)}
          style={inputStyle}
        >
          <option>Onsite</option>
          <option>Remote</option>
          <option>Hybrid</option>
        </select>

        <label>Status</label>
        <select
          value={jobStatus}
          onChange={(e) => setJobStatus(e.target.value)}
          style={inputStyle}
        >
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <label>Skills</label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          style={inputStyle}
        />

        <label>Salary</label>
        <input
          type="text"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          style={inputStyle}
        />

        <label>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={submitButtonStyle(loading)}
        >
          {loading ? "Creating..." : "Create Job"}
        </button>

        {message && (
          <p
            style={{
              marginTop: "15px",
              fontWeight: "600",
              color: message.includes("success") ? "green" : "red"
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "8px",
  background: "#F9FAFB",
  border: "1px solid #E5E7EB",
  fontSize: "15px"
};

const submitButtonStyle = (loading: boolean) => ({
  width: "100%",
  padding: "12px",
  background: loading ? "#9CA3AF" : "#2563EB",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: loading ? "not-allowed" : "pointer",
  marginTop: "20px",
  fontSize: "16px",
  fontWeight: "600"
});
