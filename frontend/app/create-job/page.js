"use client";

import Link from "next/link";

export default function CreateJobPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg bg-white shadow-lg rounded-xl p-8 text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Job Posting Coming Soon</h1>
        <p className="text-gray-600">
          The backend services for creating and managing job postings have not been wired up yet. Once
          those endpoints are implemented, this page will let you publish openings using the same Cognito
          session that now powers authentication.
        </p>
        <Link href="/dashboard" className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
