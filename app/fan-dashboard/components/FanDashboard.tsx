"use client";

import { FanSidebar } from "./FanSidebar";
import { FanHeader } from "./FanHeader";
import { FanProfileForm } from "./FanProfileForm";
import { ProfileCompletionCard } from "./ProfileCompletionCard";

export function FanDashboard() {
  return (
    <div className="h-screen bg-[#4a2c5a] flex">
      {/* Sidebar */}
      <FanSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <FanHeader />
        
        {/* Content Area */}
        <div className="flex-1 flex p-8 gap-8">
          {/* Profile Form */}
          <div className="flex-1">
            <FanProfileForm />
          </div>
          
          {/* Profile Completion Card */}
          <ProfileCompletionCard />
        </div>
      </div>
    </div>
  );
}

