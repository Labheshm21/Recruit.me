"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_CREATE_JOB_URL ||
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/createjob";

export default function CreateJobPage() {
  const router = useRouter();

  // STATE FIELDS
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobType, setJobType] = useState("Full-Time");
  const [workMode, setWorkMode] = useState("Onsite");
  const [jobStatus, setJobStatus] = useState("Active");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("Entry Level");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // FORM SUBMIT
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");

    if (!jobName.trim()) {
      setMessage("Job title is required.");
      return;
    }

    const payload = {
      job_name: jobName,
      job_description: jobDescription,
      job_type: jobType,
      work_mode: workMode,
      job_status: jobStatus,
      skills,
      experience,
      salary,
      location
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
    } catch (err: any) {
      setMessage("Network error: " + err.message);
    }

    setLoading(false);
  };

  // ---------------------- UI ----------------------

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

        {/* JOB DETAILS */}
        <h3 style={{ marginBottom: 10 }}>Job Details</h3>

        <label>Job Title *</label>
        <input
          type="text"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          placeholder="e.g. Software Engineer"
          style={inputStyle}
        />

        <label>Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Describe the role..."
          style={{ ...inputStyle, height: 100 }}
        />

        <label>Job Type</label>
        <select value={jobType} onChange={(e) => setJobType(e.target.value)} style={inputStyle}>
          <option>Full-Time</option>
          <option>Part-Time</option>
          <option>Internship</option>
          <option>Contract</option>
        </select>

        <label>Work Mode</label>
        <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} style={inputStyle}>
          <option>Onsite</option>
          <option>Remote</option>
          <option>Hybrid</option>
        </select>

        <label>Job Status</label>
        <select value={jobStatus} onChange={(e) => setJobStatus(e.target.value)} style={inputStyle}>
          <option>Active</option>
          <option>Inactive</option>
        </select>


        {/* REQUIREMENTS */}
        <h3 style={{ marginTop: 30, marginBottom: 10 }}>Requirements</h3>

        <label>Skills (comma separated)</label>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g. React, Node.js, SQL"
          style={inputStyle}
        />

        <label>Experience Level</label>
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          style={inputStyle}
        >
          <option>Entry Level</option>
          <option>Junior</option>
          <option>Mid Level</option>
          <option>Senior</option>
        </select>


        {/* COMPENSATION */}
        <h3 style={{ marginTop: 30, marginBottom: 10 }}>Compensation</h3>

        <label>Salary</label>
        <input
          type="text"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="e.g. $80k - $120k"
          style={inputStyle}
        />

        <label>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
          style={inputStyle}
        />

        {/* SUBMIT BUTTON */}
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


// ---------- SHARED STYLES ----------
const inputStyle: React.CSSProperties = {
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "8px",
  background: "#F9FAFB",
  border: "1px solid #E5E7EB",
  fontSize: "15px"
};

const submitButtonStyle = (loading: boolean): React.CSSProperties => ({
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
