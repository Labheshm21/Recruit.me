"use client";

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-lime-400 rounded flex items-center justify-center">
                <span className="text-black font-bold text-xl italic">R</span>
              </div>
              <span className="ml-2 text-xl font-semibold hidden sm:block">Recruit.Me</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => window.location.href = '/dashboardcompany'}
                className="text-gray-700 hover:text-black transition-colors"
              >
                Admin
              </button>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="text-gray-700 hover:text-black transition-colors"
              >
                Applicants
              </button>
              <button 
                onClick={() => window.location.href = '/logincompany'}
                className="text-gray-700 hover:text-black transition-colors"
              >
                Company
              </button>

            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => window.location.href = '/signup'}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Sign up
              </button>
              <button 
                onClick={() => window.location.href = '/login'}
                className="px-6 py-2 bg-lime-400 text-black rounded hover:bg-lime-500 transition-colors font-medium"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
          {/* Brand Name */}
          <div className="mb-8">
            <span className="text-lime-400 font-bold text-2xl italic">Recruit.Me</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-black mb-12 leading-tight">
            Careers<br />
            start here
          </h1>

          {/* Call to Action Buttons
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button 
              onClick={() => window.location.href = '/signup'}
              className="px-8 py-4 bg-lime-400 text-black rounded-lg hover:bg-lime-500 transition-colors font-semibold text-lg"
            >
              Get Started
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-8 py-4 border-2 border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              Sign In
            </button>
          </div>*/}

          {/* Description */}
          <p className="text-lg text-gray-600 max-w-2xl mt-12">
            Connect with top employers and discover opportunities that match your skills and aspirations.
          </p>
        </div>
      </main>
    </div>
  );
}