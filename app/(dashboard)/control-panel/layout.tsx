"use client";

import type { ReactNode } from "react";

import { ProtectedRoute } from "../../../lib/protected-route";

export default function ControlPanelLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slice-azure/40">
        {children}
      </div>
    </ProtectedRoute>
  );
}
