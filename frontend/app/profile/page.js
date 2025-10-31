'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    skills: '',
    experience: '',
    city: '',
    state: '',
    zip_code: '',
    availability: '',
    linkedin_profile: '',
    github_profile: '',
    resume_cv: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8001/api/profile/${userData.user_id}`);
      
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profile.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!profile.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!profile.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Basic phone validation - at least 10 digits
      const digits = profile.phone.replace(/\D/g, '');
      if (digits.length < 10) {
        newErrors.phone = 'Phone number must contain at least 10 digits';
      }
    }

    if (!profile.skills?.trim()) {
      newErrors.skills = 'Skills are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:8001/api/profile/${userData.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          first_name: profile.first_name.trim(),
          last_name: profile.last_name.trim(),
          phone: profile.phone.trim(),
          skills: profile.skills.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEditing(false);
        setErrors({});
        await fetchProfile(); // Refresh profile data
        setSuccessMessage('Profile updated successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        alert(data.detail || 'Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchProfile(); // Reset form with original data
    setIsEditing(false);
    setErrors({});
    setSuccessMessage('');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">PROFILE</h1>
              <div className="flex space-x-4">
                {!isEditing && (
                  <>
                    <button
                      onClick={handleBackToDashboard}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Back to Dashboard
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mx-6 mt-4 rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{successMessage}</div>
            </div>
          )}

          {/* Profile Form */}
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    First Name: *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={profile.first_name || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900 ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Last Name: *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={profile.last_name || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900 ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Email:
                  </label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Phone: *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 30842599446"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Skills and Expertise */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills and Expertise</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Your Skills: *
                  </label>
                  <textarea
                    name="skills"
                    value={profile.skills || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900 ${
                      errors.skills ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="List your skills separated by commas (e.g., JavaScript, Python, React)"
                  />
                  {errors.skills && (
                    <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Experience:
                  </label>
                  <textarea
                    name="experience"
                    value={profile.experience || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900"
                    placeholder="Describe your professional experience"
                  />
                </div>
              </div>
            </div>

            {/* Location and Work Preference */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location and Work Preference</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    City:
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    State/Province:
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={profile.state || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Zip Code:
                  </label>
                  <input
                    type="text"
                    name="zip_code"
                    value={profile.zip_code || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Availability:
                  </label>
                  <input
                    type="text"
                    name="availability"
                    value={profile.availability || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900"
                    placeholder="e.g., Immediately, 2 weeks notice, etc."
                  />
                </div>
              </div>
            </div>

            {/* Professional Links */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Links</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    LinkedIn Profile:
                  </label>
                  <input
                    type="url"
                    name="linkedin_profile"
                    value={profile.linkedin_profile || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    GitHub Profile:
                  </label>
                  <input
                    type="url"
                    name="github_profile"
                    value={profile.github_profile || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Resume/CV:
                  </label>
                  <input
                    type="text"
                    name="resume_cv"
                    value={profile.resume_cv || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black disabled:bg-gray-100 text-gray-900"
                    placeholder="Link to your resume or CV"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}