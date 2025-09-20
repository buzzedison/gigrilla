"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { ProtectedRoute } from "../../lib/protected-route";
import { useRouter } from "next/navigation";
import { ArtistSidebar } from "./components/ArtistSidebar";
import { ArtistProfileForm } from "./components/ArtistProfileForm";
import { ArtistCompletionCard } from "./components/ArtistCompletionCard";
import { ArtistMembersManager } from "./components/ArtistMembersManager";
import { ArtistBiographyManager } from "./components/ArtistBiographyManager";
import { ArtistGenresManager } from "./components/ArtistGenresManager";
import { GigAbilityMapsManager } from "./components/GigAbilityMapsManager";
import { LogoProfileArtwork } from "./components/LogoProfileArtwork";
import { ArtistPhotosManager } from "./components/ArtistPhotosManager";
import { ArtistVideosManager } from "./components/ArtistVideosManager";
import { ArtistTypeSelector } from "./components/ArtistTypeSelector";
import { Badge } from "../components/ui/badge";
import { Eye, Settings, Music } from "lucide-react";

export default function ArtistDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (!user) return;

    const loadArtistProfile = async () => {
      try {
        console.log('Loading artist profile from API...');

        // Get the artist profile from API
        const response = await fetch('/api/artist-profile');
        const result = await response.json();

        if (result.error) {
          console.error('Error loading artist profile:', result);
          if (result.error !== 'No artist profile found for user') {
            router.push('/upgrade?type=industry&role=artist');
            return;
          }
          // No artist profile found - this is normal, we'll show the form
          console.log('No artist profile found, showing form');
        }
      } catch (error) {
        console.error('Error in loadArtistProfile:', error);
      }
    };

    loadArtistProfile();
  }, [user, router]);

  const renderContent = () => {
    switch (activeSection) {
      case 'logo':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <LogoProfileArtwork />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
            </div>
          </div>
        );
      case 'photos':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistPhotosManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
            </div>
          </div>
        );
      case 'videos':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistVideosManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
            </div>
          </div>
        );
      case 'type':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistTypeSelector />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
            </div>
          </div>
        );
      case 'members':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistMembersManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
            </div>
          </div>
        );
      case 'bio':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistBiographyManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
            </div>
          </div>
        );
      case 'genres':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistGenresManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
            </div>
          </div>
        );
      case 'maps':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <GigAbilityMapsManager />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
            </div>
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <ArtistProfileForm />
            </div>
            <div className="xl:col-span-1">
              <ArtistCompletionCard />
            </div>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#4a2c5a] flex">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 h-full z-10">
          <ArtistSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 ml-64 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {activeSection === 'logo' ? 'Logo/Profile Artwork' : activeSection === 'photos' ? 'Artist Photos' : activeSection === 'videos' ? 'Artist Videos' : activeSection === 'type' ? 'Change Artist Type' : activeSection === 'members' ? 'Artist Members' : activeSection === 'bio' ? 'Artist Biography' : activeSection === 'genres' ? 'Artist Genres' : activeSection === 'maps' ? 'GigAbility Maps' : 'Artist Dashboard'}
                    </h1>
                    <p className="text-gray-300">
                      {activeSection === 'logo' ? 'Upload your logo and profile artwork' : activeSection === 'photos' ? 'Upload and manage your artist photos' : activeSection === 'videos' ? 'Embed and manage your artist videos' : activeSection === 'type' ? 'Select your artist type and configuration' : activeSection === 'members' ? 'Manage your artist members and their details' : activeSection === 'bio' ? 'Write and share your artist story' : activeSection === 'genres' ? 'Define your music genres and sub-genres' : activeSection === 'maps' ? 'Set your gig locations and pricing areas' : 'Manage your artist profile and content'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-200 border-purple-500/30">
                    <Music className="w-4 h-4 mr-2" />
                    {activeSection === 'logo' ? 'Logo/Artwork' : activeSection === 'photos' ? 'Photos' : activeSection === 'videos' ? 'Videos' : activeSection === 'type' ? 'Artist Type' : activeSection === 'members' ? 'Members' : activeSection === 'bio' ? 'Biography' : activeSection === 'genres' ? 'Genres' : activeSection === 'maps' ? 'Gig Maps' : 'Artist Profile'}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              {renderContent()}

              {/* Breathing space at bottom */}
              <div className="h-20"></div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
