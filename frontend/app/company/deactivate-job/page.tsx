"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_COMPANY_DEACTIVATE_JOB!;

export default function DeactivateJobPage() {
  const [jobId, setJobId] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(jobId) }),
    });

    const data = await res.json();
    setMsg(res.ok ? "Job Deactivated!" : data.error || "Failed");
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Deactivate Job</h1>

      <form onSubmit={submit}>
        <input style={input} value={jobId} onChange={(e) => setJobId(e.target.value)} />
        <button style={button}>Deactivate</button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}

const input = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const button = {
  width: "100%",
  padding: 12,
  background: "#DC2626",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};
