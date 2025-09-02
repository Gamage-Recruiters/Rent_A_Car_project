import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Car } from "lucide-react";
import { useSuperAdminAuth } from "../../context/SuperAdminAuthContext.tsx";
import axios from "axios";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);

  const { loginSuperAdmin ,requestPasswordReset} = useSuperAdminAuth();
  const navigate = useNavigate();

  // ✅ Handle login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const success = await loginSuperAdmin(email, password);
      if (success) {
        navigate("/admin-dashboard");
      } else {
        setError("Invalid credentials or not a Super Admin");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle forgot password
  const handleResetRequest = async (e: React.FormEvent) => {
  e.preventDefault();
  setResetMessage("");
  setError("");
  try {
    const message = await requestPasswordReset(resetEmail);
    setResetMessage(message);
  } catch (err: any) {
    setError(err.message);
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-blue-600">
            <Car className="w-8 h-8" />
            <span className="text-2xl font-bold">RentACar</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your admin account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800">Admin Login</h2>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Reset message */}
          {resetMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <p className="text-green-600 text-sm">{resetMessage}</p>
            </div>
          )}

          {!showResetForm ? (
            // ✅ Login form
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={() => setShowResetForm(true)}
                  className="text-blue-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  "Login as Admin"
                )}
              </button>
            </form>
          ) : (
            // ✅ Forgot Password form
            <form onSubmit={handleResetRequest} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Enter your email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Send Reset Link
              </button>
              <button
                type="button"
                onClick={() => setShowResetForm(false)}
                className="w-full mt-2 text-gray-600 hover:underline"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
