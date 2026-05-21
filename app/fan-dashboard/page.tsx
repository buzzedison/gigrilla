"use client";

import { useAuth } from "../../lib/auth-context";
import { FanDashboard } from "./components/FanDashboard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function FanDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    // Only redirect if we're sure there's no user (not during loading)
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const checkOnboardingStatus = async () => {
      if (!user) return;

      try {
        // Artists belong on the artist dashboard — redirect them away from the fan feed.
        const artistResponse = await fetch('/api/artist-profile');
        if (artistResponse.ok) {
          const artistResult = await artistResponse.json();
          if (artistResult.data) {
            router.replace('/artist-dashboard');
            return;
          }
        }
      } catch {
        // If the check fails, fall through to the fan dashboard.
      }

      try {
        const response = await fetch('/api/fan-profile');
        const result = await response.json();
        setOnboardingCompleted(result.data?.onboarding_completed || false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setOnboardingCompleted(false);
      }
    };

    if (!loading && user) {
      checkOnboardingStatus();
    }
  }, [user, loading, router]);

  if (loading || onboardingCompleted === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#4a2c5a]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Pass onboarding status to FanDashboard to show appropriate content
  return <FanDashboard showMusicContent={onboardingCompleted} />;
}