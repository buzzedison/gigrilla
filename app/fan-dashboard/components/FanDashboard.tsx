"use client";

import { useState } from "react";

import { FanSidebar } from "./FanSidebar";
import { FanHeader } from "./FanHeader";
import { FanProfileForm } from "./FanProfileForm";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { FanMusicContent } from "./FanMusicContent";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../components/ui/sheet";

interface FanDashboardProps {
  showMusicContent?: boolean;
}

export function FanDashboard({ showMusicContent = false }: FanDashboardProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetContent
        side="left"
        className="w-full max-w-[20rem] p-0 sm:max-w-sm"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Fan navigation</SheetTitle>
        </SheetHeader>
        <FanSidebar
          onNavigate={() => setMobileSidebarOpen(false)}
          className="h-full w-full"
        />
      </SheetContent>

      <div className="min-h-screen bg-[#4a2c5a] font-ui lg:flex lg:overflow-hidden">
        <div className="hidden lg:flex lg:w-72 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-white/10">
          <FanSidebar />
        </div>

        <div className="flex-1 lg:flex lg:min-h-screen lg:flex-col">
          <FanHeader onOpenSidebar={() => setMobileSidebarOpen(true)} />

          {showMusicContent ? (
            <FanMusicContent />
          ) : (
            <div className="flex flex-1 flex-col gap-6 px-4 pb-16 pt-4 sm:px-6 lg:flex-row lg:gap-8 lg:overflow-hidden lg:pb-8 lg:pl-8 lg:pr-10">
              <div className="flex-1 min-w-0 lg:overflow-y-auto">
                <FanProfileForm />
              </div>

              <div className="w-full flex-none lg:w-[360px] lg:overflow-y-auto">
                <ProfileCompletionCard />
              </div>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
}
