"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
// getClient import removed - not used

interface ProfileData {
  username: string;
  email: string;
  location: string;
  bio: string;
  genreCount: number;
}

export function ProfileCompletionCard() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    username: "",
    email: "",
    location: "",
    bio: "",
    genreCount: 0
  });
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Always try to load, will handle no user gracefully
    loadProfileData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Reload data when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('ProfileCompletionCard: Page became visible, reloading profile...');
        loadProfileData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadProfileData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('ProfileCompletionCard: Starting to load profile data for user:', user.id);

    try {
      const fallbackProfile: ProfileData = {
        username: user.user_metadata?.username ||
          user.user_metadata?.display_name ||
          (user.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata?.last_name || ''}`.trim() : '') ||
          user.email?.split('@')[0] || "Fan",
        email: user.email || "",
        location: user.user_metadata?.city || user.user_metadata?.address || "",
        bio: user.user_metadata?.bio || "",
        genreCount: 0
      };

      console.log('ProfileCompletionCard: Setting fallback data first:', fallbackProfile);
      setProfileData(fallbackProfile);
      calculateCompletion(fallbackProfile);
      
      // Set loading to false AFTER setting the fallback data
      setLoading(false);

        console.log('ProfileCompletionCard: Attempting to load enhanced profile data from fan_profiles...');
        console.log('ProfileCompletionCard: User ID for query:', user.id);

        const loadEnhancedProfile = async () => {
          try {
            console.log('ProfileCompletionCard: Starting fan_profiles query...');

            // Use API endpoint instead of direct database query
            console.log('ProfileCompletionCard: Fetching data from API endpoint...');
            const apiPromise = fetch('/api/fan-profile')
              .then(response => response.json())
              .then(result => {
                console.log('ProfileCompletionCard: API response:', result);

                // Transform API response to match expected format
                if (result.data) {
                  return {
                    data: result.data,
                    error: null
                  };
                } else {
                  return {
                    data: null,
                    error: { code: 'PGRST116', message: result.message || 'No profile found' }
                  };
                }
              })
              .catch(error => {
                console.log('ProfileCompletionCard: API error:', error);
                return {
                  data: null,
                  error: {
                    code: 'API_ERROR',
                    message: error.message || 'API call failed'
                  }
                };
              });
            
            const timeoutPromise = new Promise(resolve =>
              setTimeout(() => resolve({ data: null, error: { code: 'TIMEOUT', message: 'Profile query timeout' } }), 10000)
            );
            
            const queryResult = await Promise.race([
              apiPromise,
              timeoutPromise
            ]) as { data: unknown; error: unknown };

            const { data: profileData, error: profileError } = queryResult;

            console.log('ProfileCompletionCard: Query result:', {
              data: profileData,
              error: profileError,
              errorType: typeof profileError,
              isTimeout: (profileError as unknown as { code?: string })?.code === 'TIMEOUT'
            });

          if (profileError) {
            console.log('ProfileCompletionCard: Profile load fallback (no data or timeout):', (profileError as unknown as { message?: string })?.message || profileError);
            // This is normal for new users - don't log as error
            return;
          }

          const typedProfileData = profileData as unknown as { 
            username?: string; 
            display_name?: string; 
            bio?: string; 
            location_details?: Record<string, string>; 
          };
          
          if (!profileData || (!typedProfileData.username && !typedProfileData.display_name && !typedProfileData.bio && !typedProfileData.location_details)) {
            console.log('ProfileCompletionCard: No meaningful profile data found (all fields null), keeping fallback data');
            return;
          }

          // Get genre count from the fan_profiles preferred_genre_ids array
          const genreCount = (profileData as unknown as { preferred_genre_ids?: string[] })?.preferred_genre_ids?.length || 0;

          const locationDetails = typedProfileData.location_details;
          const inferredLocation = locationDetails?.address || '';

          const enhancedProfile: ProfileData = {
            username: typedProfileData.username || typedProfileData.display_name || fallbackProfile.username,
            email: user.email || '',
            location: inferredLocation,
            bio: typedProfileData.bio || '',
            genreCount: genreCount ?? fallbackProfile.genreCount
          };

          console.log('ProfileCompletionCard: Updating with enhanced profile data:', enhancedProfile);
          setProfileData(enhancedProfile);
          calculateCompletion(enhancedProfile);
        } catch (enhancedError) {
          console.error('ProfileCompletionCard: Enhanced data loading failed, keeping fallback data:', enhancedError);
        }
      };

      void loadEnhancedProfile();
    } catch (error) {
      console.error('ProfileCompletionCard: Error in loadProfileData:', error);

      const emergencyProfile: ProfileData = {
        username: user.email?.split('@')[0] || "Fan",
        email: user.email || "",
        location: "",
        bio: "",
        genreCount: 0
      };

      setProfileData(emergencyProfile);
      calculateCompletion(emergencyProfile);
      setLoading(false);
    }
  };

  const calculateCompletion = (data: ProfileData) => {
    let completed = 0;
    const total = 5; // username, email, location, bio, genres (min 3)

    if (data.username) completed++;
    if (data.email) completed++;
    if (data.location) completed++;
    if (data.bio) completed++;
    if (data.genreCount >= 3) completed++;

    const percentage = Math.round((completed / total) * 100);
    setCompletionPercentage(percentage);
  };

  const socialPlatforms = [
    { name: "Facebook", icon: "f", color: "bg-blue-600" },
    { name: "Twitter", icon: "t", color: "bg-sky-500" },
    { name: "Instagram", icon: "i", color: "bg-pink-600" },
  ];

  const photoSlots = Array(4).fill(null);
  const videoSlots = Array(4).fill(null);

  const getCompletionColor = () => {
    if (completionPercentage >= 80) return "stroke-green-500";
    if (completionPercentage >= 50) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  const getProfileIcon = () => {
    if (completionPercentage >= 80) return "✅";
    if (completionPercentage >= 50) return "⚡";
    return "❓";
  };

  if (loading) {
    return (
      <div className="w-full rounded-2xl bg-[#e8d5e8] p-5 font-ui shadow-lg sm:p-6">
        <div className="flex h-64 flex-col items-center justify-center">
          <div className="mb-4 h-2 w-2 animate-pulse rounded-full bg-purple-600"></div>
          <div className="text-sm text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl bg-[#e8d5e8] p-5 font-ui shadow-lg sm:p-6 lg:sticky lg:top-8">
      {/* Progress Circle */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-24 h-24 mb-4">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#d1b3d1"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              className={getCompletionColor()}
              strokeWidth="2"
              strokeDasharray={`${completionPercentage}, 100`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">{getProfileIcon()}</span>
            </div>
          </div>
        </div>
        <h3 className="text-gray-800 text-center">
          Your Profile is {completionPercentage}% complete
        </h3>
      </div>

      {/* Profile Info */}
      <div className="space-y-4 mb-6">
        <div>
          <div className={`${profileData.username ? 'text-gray-800' : 'text-gray-500 italic'}`}>
            {profileData.username || 'Username not set'}
          </div>
          <div className="text-gray-600 text-sm">Music Fan</div>
        </div>
        
        <div className="flex space-x-2">
          {socialPlatforms.map((platform, index) => (
            <div
              key={index}
              className={`w-6 h-6 ${platform.color} rounded-full flex items-center justify-center opacity-50`}
              title={`${platform.name} (coming soon)`}
            >
              <span className="text-white text-xs font-bold">{platform.icon}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 text-sm">
          <div className={`${profileData.location ? 'text-gray-800' : 'text-gray-500 italic'}`}>
            {profileData.location || 'Location not set'}
          </div>
          <div className={`${profileData.email ? 'text-gray-800' : 'text-gray-500 italic'}`}>
            {profileData.email || 'Email not set'}
          </div>
          <div className={`${profileData.genreCount >= 3 ? 'text-gray-800' : 'text-gray-500 italic'}`}>
            {profileData.genreCount >= 3 
              ? `${profileData.genreCount} music genres selected`
              : `${profileData.genreCount}/3 music genres (need 3+)`
            }
          </div>
        </div>
      </div>

      {/* Photos Section */}
      <div className="mb-6">
        <div className="text-gray-600 text-sm mb-2">Photos (Coming Soon)</div>
        <div className="grid grid-cols-4 gap-2">
          {photoSlots.map((_, index) => (
            <div
              key={index}
              className="w-12 h-12 border-2 border-dashed border-gray-400 rounded flex items-center justify-center"
            >
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Videos Section */}
      <div>
        <div className="text-gray-600 text-sm mb-2">Videos (Coming Soon)</div>
        <div className="grid grid-cols-4 gap-2">
          {videoSlots.map((_, index) => (
            <div
              key={index}
              className="w-12 h-12 border-2 border-dashed border-gray-400 rounded flex items-center justify-center"
            >
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Tips */}
      {completionPercentage < 100 && (
        <div className="mt-4 p-3 bg-purple-100 rounded-lg">
          <div className="text-purple-800 text-xs font-medium mb-1">Complete your profile:</div>
          <ul className="text-purple-700 text-xs space-y-1">
            {!profileData.username && <li>• Add a username</li>}
            {!profileData.location && <li>• Set your location</li>}
            {!profileData.bio && <li>• Write your bio</li>}
            {profileData.genreCount < 3 && <li>• Music genres loaded from signup</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
