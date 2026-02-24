"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAuth() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Simple password protection - you can change this password
  const ADMIN_PASSWORD = "linqadmin2025";

  useEffect(() => {
    // Check if already authenticated
    const isAuthenticated = sessionStorage.getItem('admin_authenticated');
    if (isAuthenticated === 'true') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Password submitted:", password);
    console.log("Expected password:", ADMIN_PASSWORD);

    if (password === ADMIN_PASSWORD) {
      // Set authentication flag
      sessionStorage.setItem('admin_authenticated', 'true');
      console.log("Authentication successful, redirecting to dashboard...");
      router.push('/admin/dashboard');
    } else {
      setError("Invalid password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-gray-600">Enter password to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2F5EEA] focus:border-transparent pr-12"
                  placeholder="Enter admin password"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2F5EEA] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#1E3FAE] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Access Admin"}
            </button>
          </form>

          {/* Back Link */}
          <div className="text-center mt-6">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-[#2F5EEA] transition"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
