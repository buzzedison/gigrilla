"use client";

import { useAuth } from "../../lib/auth-context";
import { FanDashboard } from "./components/FanDashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FanDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're sure there's no user (not during loading)
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show content immediately, even during loading
  // The middleware will handle auth protection at server level
  return <FanDashboard />;
}