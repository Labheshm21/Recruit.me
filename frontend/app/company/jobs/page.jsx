"use client";

import { useEffect, useState } from "react";

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState(null);

  const GET_JOBS_URL =
    "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/getjobdetails";

  const ACTIVATE_URL =
    "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/activatejob";

  const DEACTIVATE_URL =
    "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/deactivatejob";

  // ---------------- FETCH JOBS ----------------
  async function fetchJobs() {
    if (!companyId) return;

    try {
      const res = await fetch(GET_JOBS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: Number(companyId) })
      });

      const data = await res.json();
      console.log("Jobs Response:", data);

      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }

    setLoading(false);
  }

  useEffect(() => {
    const id = localStorage.getItem("company_id");
    setCompanyId(id);
  }, []);

  useEffect(() => {
    if (companyId) fetchJobs();
  }, [companyId]);

  // ---------------- ACTIVATE / DEACTIVATE ----------------
  async function updateStatus(job_id, type) {
    const url = type === "activate" ? ACTIVATE_URL : DEACTIVATE_URL;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id })
      });

      const result = await res.json();
      alert(result.message || "Updated");

      fetchJobs();
    } catch (err) {
      alert("Error updating job");
    }
  }

  if (loading) return <p className="p-6 text-gray-600">Loading jobs...</p>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Your Company Jobs</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {jobs.length === 0 ? (
          <p className="p-6 text-gray-500">No jobs created yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-700">Job Name</th>
                <th className="p-4 font-semibold text-gray-700">Type</th>
                <th className="p-4 font-semibold text-gray-700">Location</th>
                <th className="p-4 font-semibold text-gray-700">Status</th>
                <th className="p-4 font-semibold text-gray-700 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4">{job.job_name}</td>
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

                  <td className="p-4 flex gap-3 justify-center">
                    
                 <a
  href={`/company/jobs/${job.id || job.job_id || job.ID || job.JobID || job._id}/edit`}
  className="px-4 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
>
  Edit
</a>

                    {job.job_status === "active" ? (
                      <button
                        onClick={() => updateStatus(job.id, "deactivate")}
                        className="px-4 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => updateStatus(job.id, "activate")}
                        className="px-4 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
