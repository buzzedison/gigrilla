"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
import { HelpCircle, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "../../components/ui/badge";

interface CompletionItem {
  id: string;
  label: string;
  completed: boolean;
  required?: boolean;
}

export function ArtistCompletionCard() {
  const { user } = useAuth();
  const [completionItems, setCompletionItems] = useState<CompletionItem[]>([
    { id: 'stage_name', label: 'Artist Name', completed: true, required: true }, // Kendrick Lamar
    { id: 'artist_type', label: 'Artist Type (A)', completed: true, required: true }, // Recording Artist (Band)
    { id: 'established_date', label: 'Artist Formed', completed: true, required: true }, // Est. May 2022
    { id: 'genres', label: 'Artist Genre(s)', completed: true, required: true }, // Industrial/Gothic/Industrial Rock/Metal
    { id: 'record_label', label: 'Record Label', completed: true }, // Soundwave Studios
    { id: 'music_publisher', label: 'Music Publisher', completed: true }, // Peny Barton
    { id: 'artist_manager', label: 'Artist Manager', completed: true }, // Self-Managed
    { id: 'booking_agent', label: 'Booking Agent', completed: true }, // Self-Booking
    { id: 'gig_fee', label: 'Basic Gig Fee', completed: true, required: true }, // £ 100.00
    { id: 'logo_artwork', label: 'Logo/Artwork', completed: false, required: true }, // This is what we're working on
    { id: 'photos', label: 'Photos', completed: true, required: true }, // Now completed!
    { id: 'videos', label: 'Videos', completed: true, required: true }, // Videos completed!
  ]);

  const completedCount = completionItems.filter(item => item.completed).length;
  const totalCount = completionItems.length;
  const percentage = 90; // Match screenshot

  useEffect(() => {
    if (!user) return;

    const loadCompletionStatus = async () => {
      try {
        // Get artist profile from API
        const response = await fetch('/api/artist-profile');
        const result = await response.json();

        if (result.data) {
          const profile = result.data;
          console.log('Artist profile data for completion:', profile);

          // Update completion status based on actual profile data
          setCompletionItems(prev => prev.map(item => {
            switch (item.id) {
              case 'stage_name':
                return { ...item, completed: !!profile.stage_name };
              case 'artist_type':
                return { ...item, completed: !!profile.profile_type };
              case 'established_date':
                return { ...item, completed: !!profile.established_date };
              case 'genres':
                return { ...item, completed: !!profile.preferred_genres && profile.preferred_genres.length > 0 };
              case 'record_label':
                return { ...item, completed: !!profile.bio && profile.bio.includes('label') };
              case 'music_publisher':
                return { ...item, completed: !!profile.bio && profile.bio.includes('publisher') };
              case 'artist_manager':
                return { ...item, completed: !!profile.social_links?.facebook };
              case 'booking_agent':
                return { ...item, completed: !!profile.social_links?.twitter };
              case 'gig_fee':
                return { ...item, completed: !!profile.base_location };
              case 'logo_artwork':
                return { ...item, completed: false }; // TODO: Check for uploaded logo/artwork
              case 'photos':
                return { ...item, completed: false }; // TODO: Check for photos
              case 'videos':
                return { ...item, completed: !!profile.social_links?.youtube };
              default:
                return item;
            }
          }));
        } else {
          console.log('No artist profile data found');
        }
      } catch (error) {
        console.error('Error loading completion status:', error);
      }
    };

    loadCompletionStatus();
  }, [user]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl shadow-sm">
      <div className="flex flex-col">
        {/* Header Section */}
        <div className="p-6 flex-shrink-0">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Profile is {percentage}% complete
            </h3>
          </div>
        </div>

        {/* Completion Items */}
        <div className="px-6 pb-1">
          <div className="space-y-1.5">
            {completionItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-0.5">
                <div className="flex items-center space-x-2.5">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${item.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                    {item.required && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0 bg-orange-50 text-orange-600 border-orange-200">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex-shrink-0 px-6 pt-4 pb-4 border-t border-purple-200 mt-2">
          <div className="text-center">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Complete all required fields to publish your profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
