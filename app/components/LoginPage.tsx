import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { useAuth } from "../../lib/auth-context";

interface LoginPageProps {
  onNavigate: (page: "login" | "signup" | "genres" | "dashboard") => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { signIn, user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Navigate immediately if a user session exists (covers refresh/HMR and normal flow)
  useEffect(() => {
    if (user?.id) {
      onNavigate("dashboard");
    }
  }, [user, onNavigate]);

  // Navigate to the dashboard when user becomes authenticated
  useEffect(() => {
    console.log("Login component: useEffect triggered", {
      loginAttempted,
      userType: typeof user,
      userValue: user,
      hasUser: !!user,
      userId: user?.id
    });

    if (loginAttempted && user && user.id) {
      console.log("Login component: All conditions met, navigating to dashboard...");
      console.log("Login component: User ID:", user.id);
      onNavigate("dashboard");
    } else if (loginAttempted) {
      console.log("Login component: Conditions not met", {
        loginAttempted,
        hasUser: !!user,
        userId: user?.id
      });
    }
  }, [user, loginAttempted, onNavigate]);

  // Fallback timeout in case auth state doesn't update
  useEffect(() => {
    if (loginAttempted && !user) {
      const timeout = setTimeout(() => {
        console.log("Login component: Auth state timeout, checking current session...");
        if (loginAttempted) {
          setError("Login may have succeeded but authentication state didn't update. Please try refreshing the page.");
          setLoading(false);
          setLoginAttempted(false);
        }
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [loginAttempted, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setLoginAttempted(false);

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password");
      setLoading(false);
      return;
    }

    const { error } = await signIn(formData.email, formData.password);

    console.log("Sign in result:", { error, hasError: !!error });

    if (error) {
      console.error("Login error:", error);
      setError(error.message || "An error occurred during login");
      setLoading(false);
    } else {
      console.log("Login successful, waiting for auth state update...");
      setLoginAttempted(true);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
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
          <h1 className="text-3xl mb-2">Log in to Your Account</h1>
          <p className="text-gray-600">Where your talent gets rewarded.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm max-w-md">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Input
                type="email"
                placeholder="admin@company.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-gray-100 border-none pr-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-gray-100 border-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-login"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))}
              />
              <label htmlFor="remember-login" className="text-sm text-gray-600">Remember me</label>
            </div>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
            disabled={loading}
          >
            {loading ? (loginAttempted ? "Authenticating..." : "Logging In...") : "LOG IN"}
          </Button>
        </form>

        {/* Social Login */}
        <div className="mt-8 max-w-md">
          <p className="text-center text-sm text-gray-600 mb-4">Or log in using</p>
          <div className="flex justify-center space-x-4">
            <button className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
              <span className="text-sm">G+</span>
            </button>
            <button className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
              <span className="text-sm">Tw</span>
            </button>
            <button className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
              <span className="text-sm">Fb</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Purple Section */}
      <div className="flex-1 bg-gradient-to-br from-purple-800 to-purple-600 flex flex-col justify-center items-center text-white px-8">
        <div className="text-center max-w-md">
          <h2 className="text-3xl mb-4">Don't Have an Account Yet?</h2>
          <p className="text-purple-200 mb-8">
            Register in a few easy steps and experience freedom like never before
          </p>
          <Button
            onClick={() => onNavigate("signup")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
          >
            SIGN UP
          </Button>
        </div>
      </div>
    </div>
  );
}
