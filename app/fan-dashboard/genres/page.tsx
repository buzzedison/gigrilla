"use client";

import { useAuth } from "../../../lib/auth-context";
import { FanSidebar } from "../components/FanSidebar";
import { FanHeader } from "../components/FanHeader";
import { MusicGenreSelector } from "../components/MusicGenreSelector";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GenresPage() {
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
          {/* Genres Form */}
          <div className="flex-1 min-w-0">
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Select Your Music Genres</h1>
                <p className="text-gray-300">Choose at least 3 genres that represent your music taste. This helps us personalize your experience.</p>
              </div>
              
              <MusicGenreSelector />
              
              <div className="flex justify-between pt-6">
                <button 
                  onClick={() => window.history.back()}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Back to Profile
                </button>
                <button 
                  onClick={() => {
                    console.log('GenresPage: Complete Setup clicked, navigating to fan-dashboard');
                    router.push('/fan-dashboard');
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Complete Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
