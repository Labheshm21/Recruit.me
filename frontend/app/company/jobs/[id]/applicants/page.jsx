"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ApplicantsPage() {
  const { id } = useParams(); // job_id from route
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const VIEW_APPLICANTS_URL =
    "https://tg9n2lwkqk.execute-api.us-east-2.amazonaws.com/Initial/viewapplicants";

  async function fetchApplicants() {
    try {
      const res = await fetch(VIEW_APPLICANTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: Number(id) })  // CRITICAL FIX
      });

      const data = await res.json();
      console.log("Applicants API Response:", data);

      setApplicants(data.applicants || []);
    } catch (err) {
      console.error("Error loading applicants:", err);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (id) fetchApplicants();
  }, [id]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Applicants for Job #{id}</h1>

      {loading ? (
        <p>Loading...</p>
      ) : applicants.length === 0 ? (
        <p>No applicants yet.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Resume</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((a) => (
              <tr key={a.id} className="border-b">
                <td className="p-3">{a.name}</td>
                <td className="p-3">{a.email}</td>
                <td className="p-3">
                  <a
                    href={a.resume_url}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    View Resume
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
