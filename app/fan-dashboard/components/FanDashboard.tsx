"use client";

import { FanSidebar } from "./FanSidebar";
import { FanHeader } from "./FanHeader";
import { FanProfileForm } from "./FanProfileForm";
import { ProfileCompletionCard } from "./ProfileCompletionCard";

export function FanDashboard() {
  return (
    <div className="h-screen bg-[#4a2c5a] flex overflow-hidden">
      {/* Sidebar */}
      <FanSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <FanHeader />
        
        {/* Content Area */}
        <div className="flex-1 flex p-8 gap-8 overflow-auto">
          {/* Profile Form */}
          <div className="flex-1 min-w-0">
            <FanProfileForm />
          </div>
          
          {/* Profile Completion Card */}
          <div className="flex-shrink-0">
            <ProfileCompletionCard />
          </div>
        </div>
      </div>
    </div>
  );
}
