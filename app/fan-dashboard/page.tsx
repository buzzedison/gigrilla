"use client";

import { useAuth } from "../../lib/auth-context";
import { ProtectedRoute } from "../../lib/protected-route";
import { FanDashboard } from "./components/FanDashboard";

export default function FanDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <FanDashboard />
    </ProtectedRoute>
  );
}

