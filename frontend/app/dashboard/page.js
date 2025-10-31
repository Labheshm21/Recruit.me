'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

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
              {/* Updated Logo */}
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
            <div className="flex space-x-4 mb-6">
              <input
                type="text"
                placeholder="Search Jobs"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
              />
              <button className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-black">
                Search
              </button>
            </div>
            
            {/* Job Listings */}
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900">Sample Job 1</h3>
                <p className="text-gray-600 mt-1">Company Name • Location • Full-time</p>
                <p className="text-gray-500 mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <button className="mt-3 px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800">
                  Apply Now
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900">Sample Job 2</h3>
                <p className="text-gray-600 mt-1">Company Name • Location • Contract</p>
                <p className="text-gray-500 mt-2">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <button className="mt-3 px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800">
                  Apply Now
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900">Sample Job 3</h3>
                <p className="text-gray-600 mt-1">Company Name • Remote • Part-time</p>
                <p className="text-gray-500 mt-2">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                <button className="mt-3 px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800">
                  Apply Now
                </button>
              </div>
            </div>
            
            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                ←
              </button>
              {[1, 2, 3, 4, 5].map(page => (
                <button
                  key={page}
                  className={`px-3 py-1 border rounded ${
                    page === 1 
                      ? 'bg-black text-white border-black' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}