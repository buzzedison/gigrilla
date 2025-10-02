"use client";

import { useState } from "react";

import { FanSidebar } from "./FanSidebar";
import { FanHeader } from "./FanHeader";
import { FanProfileForm } from "./FanProfileForm";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../components/ui/sheet";

export function FanDashboard() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetContent side="left" className="w-full max-w-xs p-0 sm:max-w-sm">
        <SheetHeader className="sr-only">
          <SheetTitle>Fan navigation</SheetTitle>
        </SheetHeader>
        <FanSidebar onNavigate={() => setMobileSidebarOpen(false)} className="h-full" />
      </SheetContent>

      <div className="min-h-screen bg-[#4a2c5a] lg:flex lg:overflow-hidden">
        {/* Sidebar (desktop) */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:overflow-y-auto">
          <FanSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:flex lg:flex-col lg:min-h-screen">
          {/* Header */}
          <FanHeader onOpenSidebar={() => setMobileSidebarOpen(true)} />

          {/* Content Area */}
          <div className="flex flex-1 flex-col gap-6 p-4 pb-16 sm:p-6 lg:flex-row lg:gap-8 lg:overflow-hidden lg:pb-8 lg:pr-8">
            <div className="flex-1 min-w-0 lg:overflow-y-auto lg:pr-2">
              <FanProfileForm />
            </div>

            <div className="w-full flex-none lg:w-[320px] lg:overflow-y-auto">
              <ProfileCompletionCard />
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
