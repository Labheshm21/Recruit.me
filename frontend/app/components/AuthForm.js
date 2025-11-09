'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthForm({ type }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      alert("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (type === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        alert("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = type === 'login' ? 'login' : 'signup';
      const response = await fetch(`http://localhost:8001/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        if (type === 'login') {
          // For login: Store user data and redirect to dashboard
          alert('Login successful!');
          localStorage.setItem('user', JSON.stringify({
            user_id: data.user_id,
            email: data.email
          }));
          router.push('/dashboard');
        } else {
          // For signup: Show success message and redirect to login page
          alert('Account created successfully! Please log in with your credentials.');
          router.push('/login');
        }
        
        setFormData({
          email: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        // Handle specific error cases with user-friendly messages
        if (response.status === 400) {
          if (type === 'signup') {
            alert(data.detail || "User Already Exists! Please, Try Again");
          } else {
            alert(data.detail || "Invalid request. Please check your input.");
          }
        } else if (response.status === 401 && type === 'login') {
          alert("Incorrect Credentials, Try Again");
        } else if (data.detail) {
          // Show the specific error message from server
          alert(data.detail);
        } else {
          alert('An error occurred. Please try again.');
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Check if email is empty for forgot password link
  const isEmailEmpty = !formData.email.trim();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {/* Updated Logo */}
          <div className="mx-auto text-center">
            <div className="text-3xl font-bold text-black">RECRUIT.ME</div>
            <div className="text-sm text-gray-600 mt-1">Job Portal</div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {type === 'login' ? 'LOGIN' : 'Create an Account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength="6"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder={type === 'login' ? 'Password' : 'Create Password (min 6 characters)'}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {type === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength="6"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {type === 'login' && (
            <div className="flex items-center justify-end">
              <div className="text-sm">
                {isEmailEmpty ? (
                  <span className="text-gray-400 cursor-not-allowed">
                    Forgot password?
                  </span>
                ) : (
                  <Link href="/forgot-password" className="font-medium text-black hover:text-gray-700">
                    Forgot password?
                  </Link>
                )}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {loading ? 'Processing...' : (type === 'login' ? 'LOGIN' : 'SIGN UP')}
            </button>
          </div>

          <div className="text-center">
            {type === 'login' ? (
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-black hover:text-gray-700">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-black hover:text-gray-700">
                  Login
                </Link>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}