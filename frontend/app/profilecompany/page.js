"use client";

import Link from "next/link";

export default function CompanyProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-xl bg-white shadow-lg rounded-xl p-8 space-y-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-gray-600">
          This section will let companies manage their organisation details and post jobs. It currently
          awaits supporting backend endpoints. Authentication is ready, so once those APIs land you can
          reuse the stored Cognito tokens to secure the requests.
        </p>
        <Link href="/dashboard" className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
