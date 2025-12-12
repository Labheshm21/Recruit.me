"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Job {
  id: number;
  job_name: string;
  job_type: string;
  location: string;
  job_status: string;
  job_description?: string;
  requirements?: string;
  salary?: string;
  skills?: string;
  work_mode?: string;
}

const GET_JOB_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/getjobdetails";
const ACTIVATE_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/activatejob";
const DEACTIVATE_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/deactivatejob";

function JobDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobIdFromQuery = searchParams.get("id");

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Report state
  const [skillQuery, setSkillQuery] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);

  const [jobId, setJobId] = useState<string | null>(jobIdFromQuery);

  async function fetchJob() {
    if (!jobId) {
      setError("No job ID provided");
      setLoading(false);
      return;
    }

    try {
      const companyId = localStorage.getItem("company_id");
      const res = await fetch(GET_JOB_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: Number(companyId) }),
      });

      const data = await res.json();
      const foundJob = data.jobs?.find((j: Job) => j.id === Number(jobId));
      if (!foundJob) {
        setError("Job not found");
      } else {
        setJob(foundJob);
      }
    } catch (e) {
      setError("Failed to load job details");
    }

    setLoading(false);
  }

  useEffect(() => {
    if (!jobIdFromQuery) {
      const stored = sessionStorage.getItem("view_job_id");
      if (stored) setJobId(stored);
    }
  }, [jobIdFromQuery]);

  useEffect(() => {
    if (jobId) fetchJob();
  }, [jobId]);

  if (loading) return <p className="p-8">Loading…</p>;
  if (error || !job) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">{job.job_name}</h1>
          <p className="text-gray-600">Skills Required: {job.skills}</p>
        </div>

        {/* Application Match Report */}
        <div id="report" className="p-6 border-t">
          <h2 className="text-lg font-bold mb-2">
            📊 Application Match Report
          </h2>

          <p className="text-sm text-gray-600 mb-3">
            Enter skills to check how many applicants match this job.
          </p>

          <input
            value={skillQuery}
            onChange={(e) => setSkillQuery(e.target.value)}
            placeholder="e.g. Java, Spring"
            className="w-full border p-2 rounded mb-3"
          />

          <button
            onClick={() => {
              const tokens = skillQuery
                .split(",")
                .map((s) => s.trim().toLowerCase())
                .filter(Boolean);

              if (!tokens.length) {
                alert("Enter at least one skill");
                return;
              }

              const jobSkills = (job.skills || "").toLowerCase();
              const matchesJob = tokens.every((t) =>
                jobSkills.includes(t)
              );

              if (!matchesJob) {
                setMatchCount(0);
                return;
              }

              const stored = localStorage.getItem("last_applicants");
              if (!stored) {
                alert("Open Applicants page first to load data");
                return;
              }

              const applicants = JSON.parse(stored);
              setMatchCount(applicants.length);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Generate Report
          </button>

          {matchCount !== null && (
            <div className="mt-4 font-semibold text-blue-600">
              {matchCount} applicant{matchCount === 1 ? "" : "s"} match your
              list.
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-4">
          <button
            onClick={() => router.push("/company/job-applicants")}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            View Applicants
          </button>
          <button
            onClick={() => router.push("/company/jobs")}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobDetailsPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading…</p>}>
      <JobDetailsContent />
    </Suspense>
  );
}
