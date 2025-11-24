"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditJobPage() {
  const { id } = useParams();
  const router = useRouter();

  const GET_JOB_DETAILS =
    "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/getjobdetails";

  const EDIT_JOB_URL =
    "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/editjob";

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");

  async function loadJob() {
    try {
      const cid = localStorage.getItem("company_id");

      const res = await fetch(GET_JOB_DETAILS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: Number(cid) })
      });

      const data = await res.json();

      const found = (data.jobs || []).find((j) => j.id == id);
      setJob(found || null);
      setLoading(false);
    } catch (err) {
      console.error("Error loading job:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJob();
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    setMessage("");

    const payload = {
      job_id: id,
      job_name: job.job_name,
      job_description: job.job_description,
      job_type: job.job_type,
      work_mode: job.work_mode,
      job_status: job.job_status,
      skills: job.skills,
      salary: job.salary,
      location: job.location
    };

    try {
      const res = await fetch(EDIT_JOB_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const out = await res.json();

      if (res.ok) {
        setMessage("Job updated successfully!");
        setTimeout(() => router.push("/company/jobs"), 1200);
      } else {
        setMessage(out.error || "Failed to update job");
      }
    } catch (err) {
      setMessage("Network error: " + err.message);
    }
  }

  if (loading) return <p className="p-6 text-gray-600">Loading job...</p>;
  if (!job) return <p className="p-6 text-red-600">Job not found.</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Job</h1>

      <form onSubmit={handleUpdate} className="space-y-4 bg-white p-6 rounded-lg shadow-lg">

        <div>
          <label className="font-semibold">Job Title</label>
          <input
            type="text"
            value={job.job_name}
            onChange={(e) => setJob({ ...job, job_name: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="font-semibold">Job Description</label>
          <textarea
            value={job.job_description}
            onChange={(e) => setJob({ ...job, job_description: e.target.value })}
            className="w-full p-3 border rounded-lg h-32"
          />
        </div>

        <div>
          <label className="font-semibold">Job Type</label>
          <select
            value={job.job_type}
            onChange={(e) => setJob({ ...job, job_type: e.target.value })}
            className="w-full p-3 border rounded-lg"
          >
            <option value="fulltime">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">Work Mode</label>
          <select
            value={job.work_mode}
            onChange={(e) => setJob({ ...job, work_mode: e.target.value })}
            className="w-full p-3 border rounded-lg"
          >
            <option value="onsite">Onsite</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">Skills</label>
          <input
            type="text"
            value={job.skills}
            onChange={(e) => setJob({ ...job, skills: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="font-semibold">Salary</label>
          <input
            type="text"
            value={job.salary}
            onChange={(e) => setJob({ ...job, salary: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="font-semibold">Location</label>
          <input
            type="text"
            value={job.location}
            onChange={(e) => setJob({ ...job, location: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="font-semibold">Status</label>
          <select
            value={job.job_status}
            onChange={(e) => setJob({ ...job, job_status: e.target.value })}
            className="w-full p-3 border rounded-lg"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
        >
          Update Job
        </button>

        {message && (
          <p className="text-center text-sm mt-3 font-semibold">{message}</p>
        )}
      </form>
    </div>
  );
}
