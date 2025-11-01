"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, ChevronDown, Edit2, Camera } from 'lucide-react';

export default function ProfilePage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const [userid, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    aboutCompany: '',
    emailAddress: '',
    website: '',
    phoneNumber: '',
    officeAddress: '',
    faxNumber: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.user_id) {
      setUserId(user.user_id);
      fetchProfile(user.user_id);
    }
  }, []);

  const fetchProfile = async (uid) => {
    try {
      const res = await fetch(`http://localhost:8001/api/profile/${uid}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          companyName: data.firstname || "",
          aboutCompany: data.experience || "",
          emailAddress: data.email || "",
          website: data.linkedinprofile || "",
          phoneNumber: data.phone || "",
          officeAddress: data.city || "",
          faxNumber: data.githubprofile || ""
        });
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSave = async () => {
    setIsEditing(false);
    const payload = {
      firstname: formData.companyName,
      experience: formData.aboutCompany,
      email: formData.emailAddress,
      linkedinprofile: formData.website,
      phone: formData.phoneNumber,
      city: formData.officeAddress,
      githubprofile: formData.faxNumber
    };
    try {
      const res = await fetch(`http://localhost:8001/api/profile/${userid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok) {
        alert("Profile updated!");
      } else {
        alert(result.detail || "Update failed");
      }
    } catch (err) {
      alert("Network error updating profile.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userid) fetchProfile(userid);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsDropdownOpen(false);
  };

  const FormField = ({ label, name, type = "text", multiline = false }) => (
    <div className="flex items-start gap-4">
      <label className="w-48 font-semibold text-right pt-3">{label}:</label>
      {multiline ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          disabled={!isEditing}
          rows="4"
          className={`flex-1 px-4 py-3 border border-gray-300 rounded resize-none ${isEditing ? 'focus:outline-none focus:border-blue-500 bg-white' : 'bg-gray-50 cursor-not-allowed'}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          disabled={!isEditing}
          className={`flex-1 px-4 py-3 border border-gray-300 rounded ${isEditing ? 'focus:outline-none focus:border-blue-500 bg-white' : 'bg-gray-50 cursor-not-allowed'}`}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <button className="p-2 hover:bg-gray-100 rounded transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <nav className="flex gap-8">
              <button className="text-lg hover:text-gray-600 transition-colors">Job Management</button>
              <button className="text-lg hover:text-gray-600 transition-colors">View Applicants</button>
              <button className="text-lg hover:text-gray-600 transition-colors">Waitlist</button>
            </nav>
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span>{formData.companyName}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 border bg-white shadow-lg rounded-lg overflow-hidden z-10">
                <button 
                  onClick={handleEdit}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors">Settings</button>
                <button className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors text-red-600">Log Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Profile Content */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {isEditing && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">Edit Mode: Make your changes and click Save</p>
            </div>
          )}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center border-4 border-blue-400 overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-blue-200" />
                )}
              </div>
              {isEditing && (
                <button 
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
                >
                  <Camera className="w-5 h-5 text-gray-700" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
          <div className="space-y-6">
            <FormField label="Company Name*" name="companyName" />
            <FormField label="About Company" name="aboutCompany" multiline />
            <FormField label="Email Address" name="emailAddress" type="email" />
            <FormField label="Website" name="website" />
            <FormField label="Phone Number" name="phoneNumber" type="tel" />
            <FormField label="Office Address" name="officeAddress" />
            <FormField label="Fax Number" name="faxNumber" type="tel" />
          </div>
          {isEditing && (
            <div className="flex justify-center gap-6 mt-12">
              <button
                onClick={handleSave}
                className="px-12 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-12 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
