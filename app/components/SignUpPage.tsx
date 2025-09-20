"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "../../lib/auth-context";

interface SignUpPageProps {
  onNavigate: (page: "login" | "signup" | "genres" | "dashboard" | "fan-dashboard") => void;
}

export function SignUpPage({ onNavigate }: SignUpPageProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const result = await signUp(formData.email, formData.password, formData.firstName, formData.lastName);

    if (result.error) {
      setError(result.error || "An error occurred during signup");
      setLoading(false);
    } else if (result.needsEmailVerification) {
      setNeedsEmailVerification(true);
      setSignupEmail(formData.email);
      setLoading(false);
    } else {
      // Success! Navigate to fan dashboard
      onNavigate("fan-dashboard");
    }
  };

  if (needsEmailVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600">
              We&apos;ve sent a verification link to <strong>{signupEmail}</strong>
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Click the link in your email to activate your account, then come back to log in.
            </p>
            
            <Button
              onClick={() => onNavigate("login")}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Go to Login
            </Button>
            
            <button
              onClick={() => {
                setNeedsEmailVerification(false);
                setSignupEmail("");
                setError("");
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Sign Up Form */}
      <div className="flex-1 flex flex-col justify-center px-8 bg-white">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
            alt="Gigrilla Logo"
            className="h-12 w-auto"
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join as a Basic Fan - upgrade anytime!</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm max-w-md mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">First Name *</label>
              <Input
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full bg-gray-100 border-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Last Name *</label>
              <Input
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full bg-gray-100 border-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Email *</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-gray-100 border-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Password *</label>
            <Input
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-gray-100 border-none"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Confirm Password *</label>
            <Input
              type="password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full bg-gray-100 border-none"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "CREATE ACCOUNT"}
          </Button>
        </form>

        {/* Info */}
        <div className="mt-8 max-w-md">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
            You&apos;ll start as a Basic Fan with browse and RSVP features. Upgrade anytime for full access!
          </p>
        </div>
      </div>

      {/* Right Side - Purple Section */}
      <div className="flex-1 bg-gradient-to-br from-purple-800 to-purple-600 flex flex-col justify-center items-center text-white px-8">
        <div className="text-center max-w-md">
          <h2 className="text-3xl mb-4">Already Have an Account?</h2>
          <p className="text-purple-200 mb-8">
            Log in to access your Gigrilla profile and all your music connections
          </p>
          <Button
            onClick={() => onNavigate("login")}
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3"
          >
            LOG IN
          </Button>
        </div>
      </div>
    </div>
  );
}