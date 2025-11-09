"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiFetch, storeAuth } from "../../lib/api";

export default function AuthForm({ type }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      alert("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (type === "signup") {
      if (password !== formData.confirmPassword) {
        alert("Passwords don't match!");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }
    }

    try {
      if (type === "login") {
        const res = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        // --- Handle Cognito challenges first (e.g., NEW_PASSWORD_REQUIRED) ---
        // Backend may return { challenge, session, email } for challenges
        if (res?.challenge === "NEW_PASSWORD_REQUIRED") {
          router.push(
            `/reset-password?email=${encodeURIComponent(res.email || email)}&session=${encodeURIComponent(res.session || "")}`
          );
          return;
        }
        // Some SDKs return ChallengeName/Session instead
        if (res?.ChallengeName === "NEW_PASSWORD_REQUIRED") {
          router.push(
            `/reset-password?email=${encodeURIComponent(email)}&session=${encodeURIComponent(res.Session || "")}`
          );
          return;
        }

        // --- Normalize tokens before storing ---
        // Accept either:
        // 1) { accessToken, idToken, refreshToken, ... }  (flattened)
        // 2) { AuthenticationResult: { AccessToken, IdToken, ... } } (raw Cognito)
        const ar = res?.AuthenticationResult || null;
        const tokens = ar
          ? {
              accessToken: ar.AccessToken,
              idToken: ar.IdToken,
              refreshToken: ar.RefreshToken,
              tokenType: ar.TokenType,
              expiresIn: ar.ExpiresIn,
            }
          : res;

        // Persist and go to dashboard
        storeAuth(tokens);
        router.push("/dashboard");
      } else {
        await apiFetch("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        // Send the user to confirm the code
        alert("Account created! Enter the verification code sent to your email.");
        router.push(`/confirm-signup?email=${encodeURIComponent(email)}`);
      }

      // reset form after action
      setFormData({ email: "", password: "", confirmPassword: "" });
    } catch (error) {
      console.error("Authentication error:", error);
      const msg = String(error?.message || "");

      // If the user isn't confirmed, push them to the confirm page
      if (/UserNotConfirmed/i.test(msg)) {
        alert("Your account is not confirmed. Please enter the verification code.");
        router.push(`/confirm-signup?email=${encodeURIComponent(formData.email.trim())}`);
        return;
      }

      alert(msg || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto text-center">
            <div className="text-3xl font-bold text-black">RECRUIT.ME</div>
            <div className="text-sm text-gray-600 mt-1">Job Portal</div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {type === "login" ? "LOGIN" : "Create an Account"}
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
                minLength={6}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder={type === "login" ? "Password" : "Create Password (min 6 characters)"}
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {type === "signup" && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {type === "login" && (
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-black hover:text-gray-700">
                  Forgot password?
                </Link>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {loading ? "Processing..." : type === "login" ? "LOGIN" : "SIGN UP"}
            </button>
          </div>

          <div className="text-center">
            {type === "login" ? (
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="font-medium text-black hover:text-gray-700">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
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
