'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ApplicationsPage() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const userObj = JSON.parse(userData);
    setUser(userObj);
    fetchApplications(userObj.user_id);
  }, [router]);

  const fetchApplications = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8001/api/applications/me?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    setWithdrawing(applicationId);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:8001/api/applications/withdraw', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          user_id: userData.user_id
        }),
      });

      if (response.ok) {
        alert('Application withdrawn successfully!');
        // Refresh the applications list
        fetchApplications(userData.user_id);
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to withdraw application');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      alert('Error withdrawing application. Please try again.');
    } finally {
      setWithdrawing(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'applied': { color: 'bg-green-100 text-green-800', text: 'Applied' },
      'withdrawn': { color: 'bg-yellow-100 text-yellow-800', text: 'Withdrawn' },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      'accepted': { color: 'bg-blue-100 text-blue-800', text: 'Accepted' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`px-3 py-1 ${config.color} text-sm font-medium rounded-full`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <div className="flex flex-col">
                <div className="text-2xl font-bold text-black">RECRUIT.ME</div>
                <div className="text-sm text-gray-600 -mt-1">Job Portal</div>
              </div>
              <nav className="ml-10 flex space-x-8">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 font-medium py-2">
                  Search Jobs
                </Link>
                <Link 
                  href="/applications" 
                  className="text-black font-medium border-b-2 border-black py-2"
                >
                  My Applications
                </Link>
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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">My Job Applications</h2>
              <p className="text-gray-600 mt-1">
                Track all your job applications in one place
              </p>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No applications found</div>
                <p className="text-gray-400 mb-6">You haven't applied to any jobs yet.</p>
                <Link 
                  href="/dashboard" 
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <div key={application.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.job_title}
                          </h3>
                          {getStatusBadge(application.status)}
                        </div>
                        
                        <p className="text-gray-700 font-medium mb-2">
                          {application.company}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Applied:</span>{' '}
                            {formatDate(application.applied_date)}
                          </div>
                          {application.withdrawn_date && (
                            <div>
                              <span className="font-medium">Withdrawn:</span>{' '}
                              {formatDate(application.withdrawn_date)}
                            </div>
                          )}
                          {application.cover_letter && (
                            <div className="md:col-span-2">
                              <span className="font-medium">Cover Letter:</span>{' '}
                              <p className="mt-1 text-gray-700 bg-gray-50 p-3 rounded">
                                {application.cover_letter}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col space-y-2">
                        {application.status === 'applied' && (
                          <button
                            onClick={() => handleWithdraw(application.id)}
                            disabled={withdrawing === application.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          >
                            {withdrawing === application.id ? 'Withdrawing...' : 'Withdraw'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Application Timeline */}
                    <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                      <div className={`flex items-center ${application.status === 'applied' ? 'text-green-600' : ''}`}>
                        <div className={`w-2 h-2 rounded-full ${application.status === 'applied' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                        <span className="ml-2">Applied</span>
                      </div>
                      
                      {application.status === 'withdrawn' && (
                        <div className="flex items-center text-yellow-600">
                          <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                          <span className="ml-2">Withdrawn</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Application Statistics */}
            {applications.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-6 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Total Applications:</span>{' '}
                    <span className="text-gray-600">{applications.length}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Active:</span>{' '}
                    <span className="text-green-600">
                      {applications.filter(app => app.status === 'applied').length}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Withdrawn:</span>{' '}
                    <span className="text-yellow-600">
                      {applications.filter(app => app.status === 'withdrawn').length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}