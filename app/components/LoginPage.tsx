import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { useAuth } from "../../lib/auth-context";

interface LoginPageProps {
  onNavigate: (
    page:
      | "login"
      | "signup"
      | "genres"
      | "dashboard"
      | "fan-dashboard"
      | "artist-dashboard",
  ) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { signIn, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postLoginRedirecting, setPostLoginRedirecting] = useState(false);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);

  useEffect(() => {
    if (!user || !user.id || !hasAttemptedLogin) return;

    let cancelled = false;
    setPostLoginRedirecting(true);

    const checkOnboardingStatus = async () => {
      const onboardingMemberType = user.user_metadata?.onboarding_member_type;

      try {
        const artistResponse = await fetch("/api/artist-profile");
        if (artistResponse.ok) {
          const artistResult = await artistResponse.json();
          if (artistResult.data?.onboarding_completed) {
            onNavigate("artist-dashboard");
            return;
          } else if (onboardingMemberType === "artist") {
            window.location.href = `/signup?onboarding=artist`;
            return;
          }
        }
      } catch (fetchError) {
        console.error(
          "Login component: Error checking artist onboarding status",
          fetchError,
        );
      }

      try {
        const response = await fetch("/api/fan-profile");
        const result = await response.json();
        const dbOnboardingCompleted = result.data?.onboarding_completed;

        if (!dbOnboardingCompleted && onboardingMemberType === "fan") {
          window.location.href = `/signup?onboarding=fan`;
          return;
        }

        onNavigate("fan-dashboard");
      } catch (fetchError) {
        console.error(
          "Login component: Error checking fan onboarding status",
          fetchError,
        );
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
  }, [user, hasAttemptedLogin, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password");
      setLoading(false);
      return;
    }

    const { error: signInError } = await signIn(
      formData.email,
      formData.password,
    );

    if (signInError) {
      setError(signInError);
      setHasAttemptedLogin(false);
    } else {
      setHasAttemptedLogin(true);
    }

    setLoading(false);
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === "rememberMe") {
        setFormData((prev) => ({ ...prev, [field]: e.target.checked }));
        return;
      }

      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  if (authLoading || postLoginRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--g-purple-5)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--g-cerise)]" />
          <p className="text-[var(--g-purple-1)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-white">
      <div
        className="absolute inset-y-0 right-0 hidden bg-[var(--g-purple-1)] lg:block"
        style={{
          width: "50%",
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
        <img
          src="/logos/Gigrilla Gorilla Transparent Cutout.png"
          alt="Gigrilla Gorilla"
          className="h-auto w-[280px] max-w-none xl:w-[320px] 2xl:w-[360px]"
        />
      </div>

      <div className="relative z-10 flex h-full flex-col lg:flex-row">
        <div className="w-full overflow-y-auto px-6 pb-8 pt-7 sm:px-10 md:px-12 lg:w-1/2 lg:px-12 lg:pb-8 lg:pt-8 xl:px-16 xl:pt-10">
          <div className="w-full max-w-[480px]">
            <Image
              src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
              alt="Gigrilla Logo"
              width={430}
              height={132}
              className="h-auto w-[160px] sm:w-[180px] xl:w-[200px]"
              priority
            />

            <div className="mt-6 xl:mt-8">
              <h1 className="font-heading text-2xl font-bold leading-tight tracking-[0.01em] text-[var(--g-purple-2)] xl:text-3xl">
                Log in to your Account
              </h1>
              <p className="mt-2 font-ui text-base text-[var(--g-cerise)] xl:text-lg">
                you are the music industry
              </p>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-[var(--g-orange)]/25 bg-[var(--g-orange)]/8 px-4 py-3">
                <p className="text-sm text-[var(--g-orange)]">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 xl:mt-7 xl:space-y-5">
              <div className="space-y-1.5">
                <label className="block font-ui text-sm font-medium lowercase text-[var(--g-purple-2)] xl:text-base">
                  email address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="admin@company.com"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    className="h-11 rounded-xl border-0 bg-[#f5f6fb] px-4 pr-10 text-sm text-[var(--g-purple-1)] placeholder:text-[#c1c6d0] xl:h-12 xl:text-base"
                    required
                  />
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--g-purple-2)]/65" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-ui text-sm font-medium lowercase text-[var(--g-purple-2)] xl:text-base">
                  password
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    className="h-11 rounded-xl border-0 bg-[#f5f6fb] px-4 pr-10 text-sm text-[var(--g-purple-1)] placeholder:text-[#c1c6d0] xl:h-12 xl:text-base"
                    required
                  />
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--g-purple-2)]/65" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-0.5">
                <label className="flex items-center gap-2 font-ui text-sm text-[var(--g-purple-2)] xl:text-base">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        rememberMe: Boolean(checked),
                      }))
                    }
                    className="h-4 w-4 rounded-[0.3rem] border-[var(--g-purple-2)]/15 data-[state=checked]:border-[var(--g-cerise)] data-[state=checked]:bg-[var(--g-cerise)]"
                  />
                  remember me
                </label>
                <button
                  type="button"
                  className="font-ui text-sm text-[var(--g-cerise)] hover:opacity-80 xl:text-base"
                >
                  forgot password
                </button>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-[var(--g-cerise)] text-sm font-bold tracking-[0.12em] text-white hover:bg-[var(--g-cerise)]/90 xl:h-12 xl:text-base"
                disabled={loading}
              >
                {loading ? "LOGGING IN" : "LOG IN"}
              </Button>

              <div className="hidden pt-1 md:block">
                <p className="text-center font-ui text-sm text-[var(--g-purple-2)]/65">
                  or log in using
                </p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {["G+", "Tw", "Fb"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className="h-10 rounded-xl border border-[var(--g-purple-2)]/12 bg-white font-ui text-sm font-semibold text-[var(--g-purple-2)]/85 xl:h-11"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            <div className="mt-8 rounded-2xl bg-[var(--g-purple-1)] px-5 py-5 text-white lg:hidden">
              <p className="font-heading text-xl font-bold leading-tight text-white">
                Create your Account
              </p>
              <p className="mt-1.5 font-ui text-sm text-[var(--g-cerise)]">
                you are the music industry
              </p>
              <p className="mt-3 max-w-sm font-ui text-sm leading-relaxed text-white/82">
                Register and set-up your new account in a few easy steps
              </p>
              <Button
                onClick={() => onNavigate("signup")}
                className="mt-4 h-10 w-full rounded-xl bg-[var(--g-cerise)] px-6 text-sm font-bold tracking-[0.08em] text-white hover:bg-[var(--g-cerise)]/90 sm:w-auto sm:min-w-[160px]"
              >
                SIGN UP
              </Button>
            </div>
          </div>
        </div>

        <div className="relative hidden w-1/2 lg:flex lg:items-center lg:justify-center">
          <div className="relative z-10 w-[260px] xl:w-[290px] 2xl:w-[310px]">
            <h2 className="whitespace-nowrap font-heading text-2xl font-bold leading-tight text-white xl:text-3xl">
              Create your Account
            </h2>
            <p className="mt-2 font-ui text-base text-[var(--g-cerise)]">
              you are the music industry
            </p>
            <p className="mt-3 font-ui text-sm leading-relaxed text-white/78">
              Register and set-up your new account in a few easy steps
            </p>
            <Button
              onClick={() => onNavigate("signup")}
              className="mt-5 h-11 min-w-[160px] rounded-xl bg-[var(--g-cerise)] px-6 text-sm font-bold tracking-[0.1em] text-white hover:bg-[var(--g-cerise)]/90 xl:h-12 xl:min-w-[180px] xl:text-base"
            >
              SIGN UP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
