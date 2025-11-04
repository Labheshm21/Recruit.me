"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, User, ChevronDown, Edit2, Camera, CheckCircle, AlertCircle } from 'lucide-react';

// Global in-memory storage as fallback
const globalProfileStore = {
  profiles: new Map(),
  images: new Map()
};

export default function ProfilePage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [userid] = useState("demo-user-123");
  const [formData, setFormData] = useState({
    companyName: '',
    aboutCompany: '',
    emailAddress: '',
    website: '',
    phoneNumber: '',
    officeAddress: '',
    faxNumber: ''
  });

  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (userid) {
      loadProfile(userid);
    }
  }, [userid]);

  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => setSaveStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const loadProfile = async (uid) => {
    setIsLoading(true);
    try {
      let profileData = null;
      let imageData = null;
      let storageMethod = 'none';

      // Try persistent storage first
      if (window.storage) {
        try {
          const storedProfile = await window.storage.get(`profile:${uid}`);
          const storedImage = await window.storage.get(`profile-image:${uid}`);
          
          if (storedProfile && storedProfile.value) {
            profileData = JSON.parse(storedProfile.value);
            storageMethod = 'persistent';
            console.log("Loaded Profile");
          }
          if (storedImage && storedImage.value) {
            imageData = storedImage.value;
          }
        } catch (err) {
          console.log("No Data");
        }
      }

      // Fallback to global in-memory store
      if (!profileData && globalProfileStore.profiles.has(uid)) {
        profileData = globalProfileStore.profiles.get(uid);
        imageData = globalProfileStore.images.get(uid);
        storageMethod = 'memory';
        console.log("Profile loaded");
      }

      // Fallback to sessionStorage
      if (!profileData) {
        try {
          const sessionData = sessionStorage.getItem(`profile:${uid}`);
          const sessionImage = sessionStorage.getItem(`profile-image:${uid}`);
          
          if (sessionData) {
            profileData = JSON.parse(sessionData);
            storageMethod = 'session';
            console.log("Profile loaded");
          }
          if (sessionImage) {
            imageData = sessionImage;
          }
        } catch (err) {
          console.log("No data");
        }
      }

      // If still no data, start with empty profile
      if (!profileData) {
        profileData = {
          companyName: '',
          aboutCompany: '',
          emailAddress: '',
          website: '',
          phoneNumber: '',
          officeAddress: '',
          faxNumber: ''
        };
        console.log("Starting with empty profile");
      }

      setFormData(profileData);
      setOriginalData(profileData);
      if (imageData) {
        setProfileImage(imageData);
      }

      console.log(`Loaded profile using: ${storageMethod}`);
    } catch (err) {
      console.error("Error loading profile:", err);
      const emptyData = {
        companyName: '',
        aboutCompany: '',
        emailAddress: '',
        website: '',
        phoneNumber: '',
        officeAddress: '',
        faxNumber: ''
      };
      setFormData(emptyData);
      setOriginalData(emptyData);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToAllStorages = async (uid, data, image) => {
    const results = {
      persistent: false,
      memory: false,
      session: false
    };

    // 1. Save to persistent storage
    if (window.storage) {
      try {
        await window.storage.set(`profile:${uid}`, JSON.stringify(data));
        if (image) {
          await window.storage.set(`profile-image:${uid}`, image);
        }
        results.persistent = true;
        console.log("Details Saved");
      } catch (err) {
        console.warn("Failed to save:", err);
      }
    }

    // 2. Save to global in-memory store (always works)
    try {
      globalProfileStore.profiles.set(uid, { ...data });
      if (image) {
        globalProfileStore.images.set(uid, image);
      }
      results.memory = true;
      console.log("Details Saved");
    } catch (err) {
      console.warn("Failed to save:", err);
    }

    // 3. Save to sessionStorage as additional backup
    try {
      sessionStorage.setItem(`profile:${uid}`, JSON.stringify(data));
      if (image) {
        sessionStorage.setItem(`profile-image:${uid}`, image);
      }
      results.session = true;
      console.log("Details Saved");
    } catch (err) {
      console.warn("Failed to save details:", err);
    }

    return results;
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("Image is too large. Please choose an image smaller than 4MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.click();
  }, []);

  const handleSave = useCallback(async () => {
    setIsEditing(false);
    setSaveStatus(null);
    
    try {
      if (!formData.companyName.trim()) {
        alert("Company Name is required!");
        setIsEditing(true);
        return;
      }

      // Save to all available storage methods
      const saveResults = await saveToAllStorages(userid, formData, profileImage);
      
      // Determine success based on any storage method working
      const anySuccess = saveResults.persistent || saveResults.memory || saveResults.session;
      
      if (anySuccess) {
        setSaveStatus('success');
        setOriginalData({ ...formData });
        
        // Show detailed feedback
        const methods = [];
        if (saveResults.persistent) methods.push('persistent storage');
        if (saveResults.memory) methods.push('in-memory');
        if (saveResults.session) methods.push('session storage');
        
        console.log(`Profile saved successfully to: ${methods.join(', ')}`);
      } else {
        setSaveStatus('error');
        alert("⚠️ Unable to save profile. Please try again.");
      }
      
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveStatus('error');
      alert("An error occurred while saving. Please try again.");
    }
  }, [formData, profileImage, userid]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setSaveStatus(null);
    setFormData({ ...originalData });
    
    // Restore image from any available storage
    if (userid) {
      // Try persistent storage first
      if (window.storage) {
        window.storage.get(`profile-image:${userid}`)
          .then(result => {
            if (result && result.value) {
              setProfileImage(result.value);
            }
          })
          .catch(() => {
            // Fallback to in-memory
            if (globalProfileStore.images.has(userid)) {
              setProfileImage(globalProfileStore.images.get(userid));
            }
          });
      } else if (globalProfileStore.images.has(userid)) {
        setProfileImage(globalProfileStore.images.get(userid));
      }
    }
  }, [originalData, userid]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setSaveStatus(null);
    setIsDropdownOpen(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => window.location.href = '/dashboardcompany'}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Go to Dashboard"
            >
              <Menu className="w-6 h-6" />
            </button>
            <nav className="flex gap-8">
              <button className="text-lg hover:text-gray-600 transition-colors">Job Management</button>
              <button className="text-lg hover:text-gray-600 transition-colors">View Applicants</button>
              <button className="text-lg hover:text-gray-600 transition-colors">Waitlist</button>
            </nav>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <span>{formData.companyName || "Company"}</span>
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

      {/* Save Status Banner */}
      {saveStatus && (
        <div className={`${saveStatus === 'success' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border-b`}>
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-2">
            {saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Profile saved successfully! Your changes are stored and will persist when you navigate back.</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">Failed to save changes. Please try again.</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {isEditing && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 font-medium">✏️ Edit Mode: Make your changes and click Save</p>
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
                  title="Upload profile picture"
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
            <FormField 
              label="Company Name*" 
              name="companyName" 
              value={formData.companyName} 
              onChange={handleChange} 
              disabled={!isEditing}
              placeholder="Enter company name"
            />
            <FormField 
              label="About Company" 
              name="aboutCompany" 
              value={formData.aboutCompany} 
              onChange={handleChange} 
              disabled={!isEditing} 
              multiline
              placeholder="Tell us about your company..."
            />
            <FormField 
              label="Email Address" 
              name="emailAddress" 
              type="email" 
              value={formData.emailAddress} 
              onChange={handleChange} 
              disabled={!isEditing}
              placeholder="company@example.com"
            />
            <FormField 
              label="Website" 
              name="website" 
              value={formData.website} 
              onChange={handleChange} 
              disabled={!isEditing}
              placeholder="https://www.example.com"
            />
            <FormField 
              label="Phone Number" 
              name="phoneNumber" 
              type="tel" 
              value={formData.phoneNumber} 
              onChange={handleChange} 
              disabled={!isEditing}
              placeholder="+1 (555) 123-4567"
            />
            <FormField 
              label="Office Address" 
              name="officeAddress" 
              value={formData.officeAddress} 
              onChange={handleChange} 
              disabled={!isEditing}
              placeholder="123 Main St, City, State, ZIP"
            />
            <FormField 
              label="Fax Number" 
              name="faxNumber" 
              type="tel" 
              value={formData.faxNumber} 
              onChange={handleChange} 
              disabled={!isEditing}
              placeholder="+1 (555) 987-6543"
            />
          </div>

          {isEditing && (
            <div className="flex justify-center gap-6 mt-12">
              <button
                onClick={handleSave}
                className="px-12 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-12 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          {!isEditing && (
            <div className="mt-8 text-center text-gray-500 text-sm">
              Click "Edit Profile" from the menu above to make changes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const FormField = ({ label, name, type = "text", multiline = false, value, onChange, disabled, placeholder }) => (
  <div className="flex items-start gap-4">
    <label className="w-48 font-semibold text-right pt-3">{label}:</label>
    {multiline ? (
      <textarea
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={disabled ? '' : placeholder}
        rows="4"
        className={`flex-1 px-4 py-3 border border-gray-300 rounded resize-none transition-colors ${!disabled ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-text' : 'bg-gray-50 cursor-not-allowed'}`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        placeholder={disabled ? '' : placeholder}
        className={`flex-1 px-4 py-3 border border-gray-300 rounded transition-colors ${!disabled ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-text' : 'bg-gray-50 cursor-not-allowed'}`}
      />
    )}
  </div>
);
