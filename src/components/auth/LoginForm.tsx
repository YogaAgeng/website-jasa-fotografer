import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { Eye, EyeOff, Camera, Lock, Mail, AlertCircle, CheckCircle } from "lucide-react";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export default function LoginForm({ onLogin, loading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(email.includes('@') && password.length >= 6);
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await onLogin(email, password);
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Photo Booking
            </h1>
            <p className="text-gray-600 text-lg">Admin Dashboard</p>
            <p className="text-gray-500 text-sm mt-1">Masuk ke akun Anda</p>
          </div>

          {/* Login Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none ${
                      emailFocused 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${error ? 'border-red-500' : ''}`}
                    placeholder="admin@example.com"
                    required
                  />
                  {email.includes('@') && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-300 focus:outline-none ${
                      passwordFocused 
                        ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    } ${error ? 'border-red-500' : ''}`}
                    placeholder="password123"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={!isValid || loading}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                  isValid && !loading
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sedang masuk...
                  </div>
                ) : (
                  'Masuk ke Dashboard'
                )}
              </Button>
            </form>

            {/* Quick Login Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">Quick Login:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => quickLogin('admin@example.com')}
                  className="px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200 border border-blue-200"
                >
                  Admin
                </button>
                <button
                  onClick={() => quickLogin('manager@example.com')}
                  className="px-3 py-2 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors duration-200 border border-purple-200"
                >
                  Manager
                </button>
              </div>
            </div>

            {/* Demo Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-600 text-center">
                <strong>Demo Credentials:</strong><br />
                Email: admin@example.com<br />
                Password: password123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
