'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [jobsLoading, setJobsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    setLoading(false);
    fetchJobs();
  }, [router, currentPage]);

  const fetchJobs = async (search = '') => {
    setJobsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8001/api/jobs?search=${encodeURIComponent(search)}&page=${currentPage}&per_page=3`
      );
      const data = await response.json();
      
      if (response.ok) {
        setJobs(data.jobs);
        setTotalPages(data.total_pages);
        setTotalJobs(data.total_jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs(searchTerm);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleApply = (jobId) => {
    alert(`Application submitted for job #${jobId}! We'll review your profile and get back to you soon.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex flex-col">
                <div className="text-2xl font-bold text-black">RECRUIT.ME</div>
                <div className="text-sm text-gray-600 -mt-1">Job Portal</div>
              </div>
              <nav className="ml-10 flex space-x-8">
                <Link href="/dashboard" className="text-black font-medium border-b-2 border-black py-2">
                  Search Jobs
                </Link>
                <button className="text-gray-500 hover:text-gray-700 font-medium py-2">
                  My Offers
                </button>
                <button className="text-gray-500 hover:text-gray-700 font-medium py-2">
                  My Applications
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/profile" 
                className="text-gray-700 hover:text-black font-medium"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 font-medium"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Your Dream Job</h2>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex space-x-4 mb-6">
              <input
                type="text"
                placeholder="Search by job title, company, or skills (e.g., Python, React, AWS)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-black"
              >
                Search
              </button>
            </form>

            {/* Search Info */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                {totalJobs} {totalJobs === 1 ? 'job' : 'jobs'} found
                {searchTerm && ` for "${searchTerm}"`}
              </p>
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            </div>

            {/* Job Listings */}
            {jobsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-lg text-gray-600">Loading jobs...</div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No jobs found matching your criteria.</div>
                <p className="text-gray-400 mt-2">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:border-gray-400 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-lg text-gray-700 mt-1">{job.company}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">{job.location}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">{job.type}</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded">{job.experience}</span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">{job.salary}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApply(job.id)}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Apply Now
                      </button>
                    </div>

                    <p className="text-gray-600 mb-4">{job.description}</p>

                    {/* Skills Required */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Skills Required:</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full border"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Responsibilities */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Responsibilities:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {job.responsibilities.map((responsibility, index) => (
                          <li key={index}>{responsibility}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {job.requirements.map((requirement, index) => (
                          <li key={index}>{requirement}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-sm text-gray-500 mt-4">
                      Posted on {job.posted_date}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 border rounded ${
                        page === currentPage 
                          ? 'bg-black text-white border-black' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}