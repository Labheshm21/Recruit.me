"use client";

import { useEffect, useState } from "react";

interface Job {
  id: number;
  job_name: string;
  job_type: string;
  location: string;
  job_status: string;
}

export default function DeactivateJobPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Pagination states
  const [limit] = useState<number>(5);
  const [page, setPage] = useState<number>(0);
  const [totalJobs, setTotalJobs] = useState<number>(0);

  const GET_JOBS_URL =
    "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/getjobdetails";
  
  const DEACTIVATE_URL = process.env.NEXT_PUBLIC_COMPANY_DEACTIVATE_JOB || 
    "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/deactivatejob";

  async function fetchActiveJobs(): Promise<void> {
    if (!companyId) return;

    setLoading(true);

    try {
      const res = await fetch(GET_JOBS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: Number(companyId),
          job_status: "active",
          limit: limit,
          offset: page * limit
        })
      });

      const data = await res.json();
      // Get active jobs (API should filter, but also filter client-side as fallback)
      const activeJobs = (data.jobs || []).filter((job: Job) => job.job_status === "active");
      setJobs(activeJobs);
      setTotalJobs(data.total || activeJobs.length);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }

    setLoading(false);
  }

  async function handleDeactivate(jobId: number): Promise<void> {
    setActionLoading(jobId);
    try {
      const res = await fetch(DEACTIVATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId })
      });

      if (res.ok) {
        // Remove from list after deactivation
        setJobs(jobs.filter(job => job.id !== jobId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to deactivate job");
      }
    } catch (err) {
      console.error("Error deactivating job:", err);
      alert("Network error while deactivating job");
    }
    setActionLoading(null);
  }

  useEffect(() => {
    const id = localStorage.getItem("company_id");
    setCompanyId(id);
  }, []);

  useEffect(() => {
    if (companyId) fetchActiveJobs();
  }, [companyId, page]);

  if (loading) return <p className="p-6 text-gray-600">Loading active jobs...</p>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Active Jobs</h1>
        <a 
          href="/company/jobs" 
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back to All Jobs
        </a>
      </div>

      <p className="text-gray-600 mb-6">These jobs are currently active and visible to applicants. Click "Deactivate" to hide them.</p>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {jobs.length === 0 ? (
          <p className="p-6 text-gray-500">No active jobs found.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4">Job Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b">
                  <td className="p-4">{job.job_name}</td>
                  <td className="p-4 capitalize">{job.job_type}</td>
                  <td className="p-4 capitalize">{job.location}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDeactivate(job.id)}
                      disabled={actionLoading === job.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === job.id ? "Deactivating..." : "Deactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {jobs.length > 0 && (
          <div className="flex justify-center items-center gap-4 py-6 border-t">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                page === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-700 text-white hover:bg-gray-800"
              }`}
            >
              ← Previous
            </button>

            <span className="text-gray-600 font-medium">
              Page {page + 1}
            </span>

            <button
              disabled={jobs.length < limit}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                jobs.length < limit
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-700 text-white hover:bg-gray-800"
              }`}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
