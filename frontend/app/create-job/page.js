"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    employment_type: "Full-time",
    salary_min: "",
    salary_max: "",
    experience_level: "",
    openings: 1,
    remote: false,
    tags: "",
    description: "",
    requirements: "",
    responsibilities: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [createdJob, setCreatedJob] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.title.trim()) {
      alert("Please provide a job title.");
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title,
      company: form.company || undefined,
      location: form.location || undefined,
      employment_type: form.employment_type || undefined,
      salary_min: form.salary_min ? Number(form.salary_min) : undefined,
      salary_max: form.salary_max ? Number(form.salary_max) : undefined,
      experience_level: form.experience_level || undefined,
      openings: form.openings ? Number(form.openings) : 1,
      remote: !!form.remote,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      description: form.description || undefined,
      requirements: form.requirements || undefined,
      responsibilities: form.responsibilities || undefined,
    };

    try {
      const res = await fetch("http://localhost:8001/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        // show inline success message and keep user on page
        setCreatedJob(data);
        setSuccessMessage("Job created successfully.");
      } else {
        setSuccessMessage("");
        alert(data.detail || "Failed to create job");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while creating job");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      company: "",
      location: "",
      employment_type: "Full-time",
      salary_min: "",
      salary_max: "",
      experience_level: "",
      openings: 1,
      remote: false,
      tags: "",
      description: "",
      requirements: "",
      responsibilities: "",
    });
    setSuccessMessage("");
    setCreatedJob(null);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow rounded">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">Create Job</h1>
          <p className="text-sm text-gray-600 mt-1">Post a new job to attract qualified applicants. Fill out the form below and click "Create Job" when you're ready.</p>
        </div>

        {successMessage && (
          <div className="mb-4 p-4 rounded bg-green-50 border border-green-200">
            <div className="flex items-start justify-between">
              <div>
                <strong className="text-green-800">{successMessage}</strong>
                {createdJob && createdJob.id && (
                  <div className="text-sm text-gray-700 mt-1">Job ID: {createdJob.id}</div>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => router.push('/dashboardcompany')} className="px-3 py-1 bg-white border rounded">Go to Dashboard</button>
                <button type="button" onClick={resetForm} className="px-3 py-1 bg-white border rounded">Create Another</button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title</label>
              <input name="title" value={form.title} onChange={handleChange} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="e.g. Frontend Engineer" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input name="company" value={form.company} onChange={handleChange} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="Company name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="City, Country or Remote" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Employment Type</label>
              <select name="employment_type" value={form.employment_type} onChange={handleChange} className="mt-1 block w-full border px-3 py-2 rounded">
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Salary Min</label>
              <input name="salary_min" value={form.salary_min} onChange={handleChange} type="number" className="mt-1 block w-full border px-3 py-2 rounded" placeholder="Min" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Salary Max</label>
              <input name="salary_max" value={form.salary_max} onChange={handleChange} type="number" className="mt-1 block w-full border px-3 py-2 rounded" placeholder="Max" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Openings</label>
              <input name="openings" value={form.openings} onChange={handleChange} type="number" min={1} className="mt-1 block w-full border px-3 py-2 rounded" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience Level</label>
              <select name="experience_level" value={form.experience_level} onChange={handleChange} className="mt-1 block w-full border px-3 py-2 rounded">
                <option value="">Any</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input id="remote" name="remote" type="checkbox" checked={form.remote} onChange={handleChange} />
              <label htmlFor="remote" className="text-sm">Remote friendly</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="react, javascript, remote" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={6} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="Describe the role"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Requirements</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={4} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="Required skills, qualifications"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
              <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={4} className="mt-1 block w-full border px-3 py-2 rounded" placeholder="Day-to-day responsibilities"></textarea>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded disabled:opacity-60">{loading ? 'Creating…' : 'Create Job'}</button>
            <button type="button" onClick={() => router.push('/dashboardcompany')} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
