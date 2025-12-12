"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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

interface Applicant {
  id: number;
  application_status?: string;

  // skills may come under different keys depending on backend
  skills?: string;
  applicant_skills?: string;
  user_skills?: string;
  skillset?: string;

  // optional fields (not required for report)
  rating?: string;
  user_name?: string;
  applicant_name?: string;
}

const GET_JOB_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/getjobdetails";
const VIEW_APPLICANTS_URL =
  "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/viewapplicants";

function normalizeSkills(a: Applicant): string {
  return (
    a.skills ||
    a.applicant_skills ||
    a.user_skills ||
    a.skillset ||
    ""
  ).toLowerCase();
}

function JobDetailsContent() {
  const searchParams = useSearchParams();
  const jobIdFromQuery = searchParams.get("id");

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Report state
  const [skillQuery, setSkillQuery] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function generateReport() {
    const tokens = skillQuery
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (!tokens.length) {
      alert("Enter at least one skill");
      return;
    }
    if (!jobId) {
      alert("No job ID");
      return;
    }

    setReportLoading(true);
    setMatchCount(null);

    try {
      const res = await fetch(VIEW_APPLICANTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: Number(jobId) }),
      });

      const data = await res.json();
      const applicants: Applicant[] =
        data.applicants || data.data || data.applications || [];

      const count = applicants.filter((a) => {
        const s = normalizeSkills(a);
        if (!s) return false;
        return tokens.every((t) => s.includes(t));
      }).length;

      setMatchCount(count);
    } catch (e) {
      alert("Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  }

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
          <h2 className="text-lg font-bold mb-2">📊 Application Match Report</h2>

          <p className="text-sm text-gray-600 mb-3">
            Enter skills and we’ll count how many applicants have those skills.
          </p>

          <input
            value={skillQuery}
            onChange={(e) => setSkillQuery(e.target.value)}
            placeholder="e.g. Java, Spring"
            className="w-full border p-2 rounded mb-3"
          />

          <button
            onClick={generateReport}
            disabled={reportLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {reportLoading ? "Generating..." : "Generate Report"}
          </button>

          {matchCount !== null && (
            <div className="mt-4 font-semibold text-blue-600">
              {matchCount} applicant{matchCount === 1 ? "" : "s"} match your list.
            </div>
          )}
        </div>

        <div className="p-6 border-t flex gap-4">
          <Link
            href="/company/jobs"
            className="px-4 py-2 bg-gray-300 rounded inline-flex items-center"
          >
            Back to Jobs
          </Link>
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
