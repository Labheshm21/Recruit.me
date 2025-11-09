"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Menu, User, ChevronDown } from "lucide-react";

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="px-6 py-4">
          <h1 className="text-4xl font-bold mb-4">Recruit.Me</h1>
          <div className="flex items-center justify-between border-t border-b py-3">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <Menu className="w-6 h-6" />
              </button>
              <nav className="flex gap-8">
                <button className="text-lg hover:text-gray-600">Job Management</button>
                <button className="text-lg hover:text-gray-600">View Applicants</button>
                <button className="text-lg hover:text-gray-600">Waitlist</button>
              </nav>
            </div>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-50"
              >
                <User className="w-5 h-5" />
                <span>Company Name</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 border bg-white shadow-lg rounded">
                  <Link
                    href="/profilecompany"
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Settings</button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Log Out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex">
        {isMenuOpen && (
          <div className="w-64 border-r min-h-screen p-6">
            <nav className="flex flex-col gap-3">
              <button className="text-left px-4 py-2 hover:bg-gray-100 rounded">+ Create Job</button>
              <button className="text-left px-4 py-2 hover:bg-gray-100 rounded">+ Job Management</button>
              <button className="text-left px-4 py-2 hover:bg-gray-100 rounded">+ View Applicants</button>
              <button className="text-left px-4 py-2 hover:bg-gray-100 rounded">+ Waitlist</button>
            </nav>
          </div>
        )}
        <div className="flex-1 p-12">
          <h2 className="text-5xl font-light">Welcome Company Name!</h2>
        </div>
      </div>
    </div>
  );
}
