"use client";

import React, { useState } from 'react';
import { Building2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CompanyRegistration() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: 'Tech Solutions Inc',
    aboutCompany: 'Leading technology solutions provider',
    emailAddress: 'hr@techsolutions.com',
    website: 'https://www.techsolutions.com',
    phoneNumber: '+1 (555) 123-4567',
    officeAddress: '123 Tech Street, San Francisco, CA 94105',
    faxNumber: '+1 (555) 987-6543',
    password: 'password123',
    confirmPassword: 'password123'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save company profile data to localStorage
      const userId = Date.now(); // Generate a simple user ID
      
      localStorage.setItem(`company_profile_${userId}`, JSON.stringify({
        companyName: formData.companyName,
        aboutCompany: formData.aboutCompany,
        emailAddress: formData.emailAddress,
        website: formData.website,
        phoneNumber: formData.phoneNumber,
        officeAddress: formData.officeAddress,
        faxNumber: formData.faxNumber
      }));

      // Save user session
      localStorage.setItem('user', JSON.stringify({
        user_id: userId,
        email: formData.emailAddress,
        role: 'company'
      }));

      // Redirect to company dashboard immediately
      router.push('/dashboardcompany');

    } catch (err) {
      console.error("Error:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Company Registration</h1>
              <p className="text-gray-600">Enter your company details to get started</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Company Name*"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter your company name"
              required
            />

            <FormField
              label="About Company"
              name="aboutCompany"
              value={formData.aboutCompany}
              onChange={handleChange}
              placeholder="Tell us about your company..."
              multiline
            />

            <FormField
              label="Email Address*"
              name="emailAddress"
              type="email"
              value={formData.emailAddress}
              onChange={handleChange}
              placeholder="company@example.com"
              required
            />

            <FormField
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://www.example.com"
            />

            <FormField
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />

            <FormField
              label="Office Address"
              name="officeAddress"
              value={formData.officeAddress}
              onChange={handleChange}
              placeholder="123 Main St, City, State, ZIP"
            />

            <FormField
              label="Fax Number"
              name="faxNumber"
              type="tel"
              value={formData.faxNumber}
              onChange={handleChange}
              placeholder="+1 (555) 987-6543"
            />

            <FormField
              label="Password*"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            <FormField
              label="Confirm Password*"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />

            <div className="flex justify-center gap-4 mt-8 pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-12 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registering...
                  </span>
                ) : (
                  'Register Company'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const FormField = ({ label, name, type = "text", multiline = false, value, onChange, placeholder, required = false }) => (
  <div className="flex items-start gap-4">
    <label className="w-48 font-semibold text-right pt-3">
      {label}:
    </label>
    {multiline ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows="4"
        className="flex-1 px-4 py-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      />
    )}
  </div>
);