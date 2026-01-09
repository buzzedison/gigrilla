import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { useAuth } from "../../lib/auth-context";
import Image from "next/image";

interface LoginPageProps {
  onNavigate: (page: "login" | "signup" | "genres" | "dashboard" | "fan-dashboard" | "artist-dashboard") => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { signIn, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postLoginRedirecting, setPostLoginRedirecting] = useState(false);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);

  // Navigate to appropriate page after login
  useEffect(() => {
    // Only redirect if user exists AND we've actually attempted a login
    // This prevents redirects when landing on the page after logout
    if (!user || !user.id || !hasAttemptedLogin) return;

    let cancelled = false;
    setPostLoginRedirecting(true);

    const checkOnboardingStatus = async () => {
      const onboardingMemberType = user.user_metadata?.onboarding_member_type;

      // Check artist profile first
      try {
        const artistResponse = await fetch('/api/artist-profile');
        if (artistResponse.ok) {
          const artistResult = await artistResponse.json();
          if (artistResult.data?.onboarding_completed) {
            console.log("Login component: Artist onboarding complete, sending to artist dashboard...");
            onNavigate("artist-dashboard");
            return;
          } else if (onboardingMemberType === 'artist') {
            // Artist profile exists but onboarding not complete
            console.log("Login component: Artist needs to complete onboarding, redirecting to signup...");
            window.location.href = `/signup?onboarding=artist`;
            return;
          }
        }
      } catch (error) {
        console.error("Login component: Error checking artist onboarding status", error);
      }

      // Check fan profile
      try {
        const response = await fetch('/api/fan-profile');
        const result = await response.json();

        const dbOnboardingCompleted = result.data?.onboarding_completed;

        console.log("Login component: Fan onboarding check", {
          dbOnboardingCompleted,
          hasProfile: !!result.data
        });

        // If fan onboarding is incomplete and they have the onboarding flag, redirect to onboarding
        if (!dbOnboardingCompleted && onboardingMemberType === 'fan') {
          console.log("Login component: Fan needs to complete onboarding, redirecting to signup...");
          window.location.href = `/signup?onboarding=fan`;
          return;
        }

        onNavigate("fan-dashboard");
      } catch (error) {
        console.error("Login component: Error checking fan onboarding status", error);
        onNavigate("fan-dashboard");
      } finally {
        if (!cancelled) {
          setPostLoginRedirecting(false);
        }
      }
    };

    checkOnboardingStatus();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password");
      setLoading(false);
      return;
    }

    console.log("Login: Starting sign in process...");
    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      console.error("Login error:", error);
      setError(error);
      setHasAttemptedLogin(false);
    } else {
      console.log("Login successful");
      setHasAttemptedLogin(true);
    }
    setLoading(false);
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field === 'rememberMe') {
      setFormData(prev => ({ ...prev, [field]: e.target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    }
  };

  if (authLoading || postLoginRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 bg-white">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
            alt="Gigrilla Logo"
            width={200}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </div>

        {/* Form */}
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 mb-8">Sign in to your Gigrilla account</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="w-full bg-gray-100 border-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                className="w-full bg-gray-100 border-none"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: Boolean(checked) }))
                  }
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-purple-600 hover:text-purple-500"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3"
              disabled={loading}
            >
              {loading ? "Signing In..." : "SIGN IN"}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-8">
            <p className="text-xs text-gray-500">
              New to Gigrilla? Create an account to discover live music, connect with artists, and build your music community.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Purple Section */}
      <div className="flex-1 bg-gradient-to-br from-purple-800 to-purple-600 flex flex-col justify-center items-center text-white px-8">
        <div className="text-center max-w-md">
          <h2 className="text-3xl mb-4">New to Gigrilla?</h2>
          <p className="text-purple-200 mb-8">
            Join thousands of music lovers discovering live performances, connecting with artists, and building their music community
          </p>
          <Button
            onClick={() => onNavigate("signup")}
            className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3"
          >
            CREATE ACCOUNT
          </Button>
        </div>
      </div>
    </div>
  );
}
