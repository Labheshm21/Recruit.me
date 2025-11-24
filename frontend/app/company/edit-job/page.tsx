"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_EDIT_JOB_URL!;

export default function EditJobPage() {
  const [jobId, setJobId] = useState("");
  const [jobName, setJobName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [jobStatus, setJobStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!jobId.trim()) {
      setMessage("Job ID is required.");
      return;
    }

    const payload: any = { id: Number(jobId) };

    if (jobName.trim()) payload.job_name = jobName;
    if (jobDescription.trim()) payload.job_description = jobDescription;
    if (skills.trim()) payload.skills = skills;
    if (salary.trim()) payload.salary = salary;
    if (jobType.trim()) payload.job_type = jobType;
    if (location.trim()) payload.location = location;
    if (workMode.trim()) payload.work_mode = workMode;
    if (jobStatus.trim()) payload.job_status = jobStatus;

    if (Object.keys(payload).length === 1) {
      setMessage("Enter at least one field to update.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      setMessage(res.ok ? "Job updated successfully!" : data.error || "Failed");
    } catch {
      setMessage("Network error");
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <h1>Edit Job</h1>

      <form onSubmit={handleSubmit}>
        <label>Job ID *</label>
        <input style={input} value={jobId} onChange={(e) => setJobId(e.target.value)} />

        <h3>Fields to update (optional)</h3>

        <label>Job Name</label>
        <input style={input} value={jobName} onChange={(e) => setJobName(e.target.value)} />

        <label>Job Description</label>
        <textarea
          style={{ ...input, height: 90 }}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <label>Skills</label>
        <input style={input} value={skills} onChange={(e) => setSkills(e.target.value)} />

        <label>Salary</label>
        <input style={input} value={salary} onChange={(e) => setSalary(e.target.value)} />

        <label>Job Type</label>
        <input style={input} value={jobType} onChange={(e) => setJobType(e.target.value)} />

        <label>Location</label>
        <input style={input} value={location} onChange={(e) => setLocation(e.target.value)} />

        <label>Work Mode</label>
        <input style={input} value={workMode} onChange={(e) => setWorkMode(e.target.value)} />

        <label>Job Status</label>
        <input style={input} value={jobStatus} onChange={(e) => setJobStatus(e.target.value)} />

        <button style={button} type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Job"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const button: React.CSSProperties = {
  width: "100%",
  padding: 12,
  background: "#2563EB",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  cursor: "pointer",
};
