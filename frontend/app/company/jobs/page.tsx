"use client";

import { useEffect, useState } from "react";

interface Job {
  id: number;
  job_name: string;
  job_type: string;
  location: string;
  job_status: string;
}

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Pagination states
  const [limit] = useState<number>(5);
  const [page, setPage] = useState<number>(0);

  const GET_JOBS_URL =
    "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/getjobdetails";
  
  const ACTIVATE_URL = process.env.NEXT_PUBLIC_COMPANY_ACTIVATE_JOB || 
    "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/activatejob";
  
  const DEACTIVATE_URL = process.env.NEXT_PUBLIC_COMPANY_DEACTIVATE_JOB || 
    "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/deactivatejob";

  async function fetchJobs(): Promise<void> {
    if (!companyId) return;

    setLoading(true);

    try {
      const res = await fetch(GET_JOBS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: Number(companyId),
          limit: limit,
          offset: page * limit
        })
      });

      const data = await res.json();
      console.log("Paginated Jobs:", data);

      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }

    setLoading(false);
  }

  async function handleActivate(jobId: number): Promise<void> {
    setActionLoading(jobId);
    try {
      const res = await fetch(ACTIVATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId })
      });

      if (res.ok) {
        // Update local state
        setJobs(jobs.map(job => 
          job.id === jobId ? { ...job, job_status: "active" } : job
        ));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to activate job");
      }
    } catch (err) {
      console.error("Error activating job:", err);
      alert("Network error while activating job");
    }
    setActionLoading(null);
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
        // Update local state
        setJobs(jobs.map(job => 
          job.id === jobId ? { ...job, job_status: "inactive" } : job
        ));
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
    if (companyId) fetchJobs();
  }, [companyId, page]);

  if (loading) return <p className="p-6 text-gray-600">Loading jobs...</p>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Company Jobs</h1>
        <div className="flex gap-4">
          <a 
            href="/company/activate-job" 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            View Inactive Jobs
          </a>
          <a 
            href="/company/deactivate-job" 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            View Active Jobs
          </a>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {jobs.length === 0 ? (
          <p className="p-6 text-gray-500">No jobs created yet.</p>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4">Job Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <a 
                        href={`/company/job-details?id=${job.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      >
                        {job.job_name}
                      </a>
                    </td>
                    <td className="p-4 capitalize">{job.job_type}</td>
                    <td className="p-4 capitalize">{job.location}</td>

                    <td className="p-4">
                      {job.job_status === "active" ? (
                        <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="p-4 flex gap-2 justify-center flex-wrap">
                      <a
                        href={`/company/job-details?id=${job.id}`}
                        className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                      >
                        View
                      </a>
                      <a
                        href={`/company/job-edit?id=${job.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Edit
                      </a>

                      <a
                        href={`/company/job-applicants?id=${job.id}`}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                      >
                        Applicants
                      </a>

                      {job.job_status === "active" ? (
                        <button
                          onClick={() => handleDeactivate(job.id)}
                          disabled={actionLoading === job.id}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === job.id ? "..." : "Deactivate"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(job.id)}
                          disabled={actionLoading === job.id}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === job.id ? "..." : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Buttons */}
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
          </>
        )}
      </div>
    </div>
  );
}
