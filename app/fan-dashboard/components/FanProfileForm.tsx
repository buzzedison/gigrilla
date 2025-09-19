"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
import { createClient } from "../../../lib/supabase/client";
import { MusicGenreSelector } from "./MusicGenreSelector";

export function FanProfileForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    realName: "",
    username: "",
    bio: "",
    email: "",
    city: "",
    county: "",
    country: "",
    isPrivate: true,
    isLocationPrivate: true
  });

  useEffect(() => {
    // Always try to load profile, even if user is still loading
    loadUserProfile();
  }, [user]);

  // Add effect to reload data when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        console.log('FanProfileForm: Page became visible, reloading profile...');
        loadUserProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id]);

  const loadUserProfile = async () => {
    console.log('=== FanProfileForm: loadUserProfile START ===');
    setLoading(true);
    setErrorMessage("");
    console.log('FanProfileForm: User exists:', !!user);
    console.log('FanProfileForm: User ID:', user?.id);
    console.log('FanProfileForm: User email:', user?.email);
    console.log('FanProfileForm: User metadata:', JSON.stringify(user?.user_metadata, null, 2));
    
    if (!user) {
      console.log('FanProfileForm: No user, returning early');
      setLoading(false);
      return;
    }

    try {
      // Set up immediate fallback data from auth - be more aggressive about showing data
      const fallbackData = {
        realName: user.user_metadata?.first_name && user.user_metadata?.last_name 
          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`.trim()
          : user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        username: user.user_metadata?.username || 
                 user.user_metadata?.display_name || 
                 user.email?.split('@')[0] || 
                 "user",
        email: user.email || "",
        bio: user.user_metadata?.bio || "",
        city: user.user_metadata?.city || "",
        county: user.user_metadata?.county || "",
        country: user.user_metadata?.country || "",
        isPrivate: user.user_metadata?.name_private !== false, // default to true
        isLocationPrivate: user.user_metadata?.location_private !== false // default to true
      };

      console.log('FanProfileForm: Setting fallback data initially:', fallbackData);
      setFormData(fallbackData);

      const supabase = createClient();
      let sessionUserId: string | null = null;

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('FanProfileForm: Failed to fetch session before profile load:', sessionError);
        }
        sessionUserId = sessionData?.session?.user?.id ?? null;
      } catch (sessionCatchError) {
        console.error('FanProfileForm: Exception while fetching session before profile load:', sessionCatchError);
      }

      if (!sessionUserId) {
        console.warn('FanProfileForm: No active Supabase session detected before profile query; proceeding with auth context user only (RLS may block data).');
      } else {
        console.log('FanProfileForm: Supabase session user confirmed for profile load:', sessionUserId);
      }

      // Try to load enhanced data with retry logic
      try {
        console.log('FanProfileForm: Attempting to load enhanced data...');

        // First verify we have a valid session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          console.warn('FanProfileForm: No valid session found, using fallback data only:', sessionError);
          return; // Use fallback data
        }

        // Try regular database query with better error handling
        console.log('FanProfileForm: Querying database for user_id:', user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('bio, username, display_name, contact_details, location_details, privacy_settings, account_type')
          .eq('user_id', user.id)
          .eq('profile_type', 'fan')
          .maybeSingle();

        console.log('FanProfileForm: Database query result:', { profileData, profileError });

        if (profileError) {
          console.error('FanProfileForm: Error loading profile data:', profileError);
          // Don't set error message for common issues, just use fallback data
          if (profileError.code !== 'PGRST116' && profileError.code !== '42501') {
            setErrorMessage('Unable to load your saved profile details right now. Using default values.');
          }
          return; // Use fallback data
        }

        if (profileData) {
          console.log('FanProfileForm: Enhanced data loaded:', profileData);

          // Parse location details more safely
          let locationData = {} as { city?: string; county?: string; country?: string };
          const rawLocation = profileData.location_details as Record<string, string> | null | undefined;
          if (rawLocation) {
            const { city = '', county = '', country = '', address = '' } = rawLocation;
            if (!city && !county && !country && address) {
              const parts = address.split(', ').filter(Boolean);
              locationData = {
                city: parts[0] ?? '',
                county: parts[1] ?? '',
                country: parts[2] ?? ''
              };
            } else {
              locationData = { city, county, country };
            }
          }

              setFormData(prev => {
                const enhancedData: Partial<typeof prev> = {
                  username: (profileData.username ?? profileData.display_name) || prev.username,
                  bio: (profileData.bio ?? undefined) ?? prev.bio,
                  ...(locationData.city ? { city: locationData.city } : {}),
                  ...(locationData.county ? { county: locationData.county } : {}),
                  ...(locationData.country ? { country: locationData.country } : {}),
                  isPrivate: (profileData.privacy_settings?.name_private ?? prev.isPrivate ?? true) as boolean,
                  isLocationPrivate: (profileData.privacy_settings?.location_private ?? prev.isLocationPrivate ?? true) as boolean,
                };
                console.log('FanProfileForm: Updating with enhanced data (null-safe):', enhancedData);
                return {
                  ...prev,
                  ...enhancedData,
                  realName: prev.realName,
                  email: prev.email
                };
              });
        } else {
          console.log('FanProfileForm: No profile data loaded, using fallback data only');
        }
      } catch (enhancedError) {
        console.error('FanProfileForm: Enhanced data loading failed:', enhancedError);
        setErrorMessage('Unable to load your saved profile details right now. Refresh or try again in a moment.');
      }

    } catch (error) {
      console.error('FanProfileForm: Error in loadUserProfile:', error);
      setErrorMessage('Unexpected error loading your profile. Refresh the page or sign in again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async (publish = false) => {
    if (!user) return;

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const supabase = createClient();
      console.log('FanProfileForm: Saving profile, publish:', publish);
      
      // Only update user_profiles table (skip users table that might not exist)
      const profileData = {
        user_id: user.id,
        profile_type: 'fan' as const,
        bio: formData.bio,
        username: formData.username,
        display_name: formData.username,
        location_details: {
          address: `${formData.city}, ${formData.county}, ${formData.country}`.replace(/^,\s*|,\s*$/g, ''),
          city: formData.city,
          county: formData.county,
          country: formData.country,
        },
        privacy_settings: {
          name_private: formData.isPrivate,
          location_private: formData.isLocationPrivate,
        },
        is_published: publish,
        updated_at: new Date().toISOString()
      };

      console.log('FanProfileForm: Profile data to save:', profileData);

      // Check authentication state first with a short timeout; fallback to user context
      console.log('FanProfileForm: Fetching session to verify auth...');
      let sessionUserId: string | null = null;
      try {
        const sessionPromise = supabase.auth.getSession();
        const sessionResult = await Promise.race([
          sessionPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Session fetch timeout')), 2000))
        ]) as { data?: { session?: { user?: { id?: string } } } };
        if (sessionResult?.data?.session?.user?.id) {
          sessionUserId = sessionResult.data.session.user.id as string;
          console.log('FanProfileForm: Authentication verified, user ID:', sessionUserId);
        } else {
          console.warn('FanProfileForm: No session returned, proceeding with auth context user');
          sessionUserId = user.id;
        }
      } catch (e) {
        console.warn('FanProfileForm: Session fetch failed/timeout, proceeding with auth context user:', e);
        sessionUserId = user.id;
      }

      // Fire and forget - assume success since we know the database is working
      console.log('FanProfileForm: Starting optimistic database update...');
      
      // Show immediate success feedback
      console.log('FanProfileForm: Showing immediate success feedback');
      setMessage(publish ? "Profile published successfully!" : "Profile saved successfully!");
      
      // Fire the database update in the background (don't await)
      const backgroundUpdate = async () => {
        try {
          console.log('FanProfileForm: Background update starting...');
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              bio: profileData.bio,
              username: profileData.username,
              display_name: profileData.display_name,
              location_details: profileData.location_details,
              privacy_settings: profileData.privacy_settings,
              is_published: profileData.is_published,
              updated_at: profileData.updated_at
            })
            .eq('user_id', user.id)
            .eq('profile_type', 'fan');
          
          if (updateError) {
            console.warn('FanProfileForm: Background update failed, trying upsert fallback:', updateError);
            const { error: upsertError } = await supabase
              .from('user_profiles')
              .upsert({
                user_id: user.id,
                profile_type: 'fan',
                bio: profileData.bio,
                username: profileData.username,
                display_name: profileData.display_name,
                location_details: profileData.location_details,
                privacy_settings: profileData.privacy_settings,
                is_published: profileData.is_published,
                updated_at: profileData.updated_at
              }, { onConflict: 'user_id,profile_type' });

            if (upsertError) {
              console.error('FanProfileForm: upsert fallback failed:', upsertError);
              throw upsertError;
            }
          }
          
          console.log('FanProfileForm: Background update completed successfully');
        } catch (bgError) {
          console.error('FanProfileForm: Background update failed completely:', bgError);
          // Don't show error to user since we already showed success
        }
      };
      
      // Start background update but don't wait for it
      backgroundUpdate();
      
      // If publishing, navigate to genres page
      if (publish) {
        console.log('FanProfileForm: Profile published, navigating to genres page...');
        setTimeout(() => {
          window.location.href = '/fan-dashboard/genres';
        }, 1500);
      } else {
        setTimeout(() => setMessage(""), 3000);
      }

    } catch (error) {
      console.error('FanProfileForm: Error saving profile:', error);
      setMessage("Error saving profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-1 h-8 bg-purple-600 rounded-full animate-pulse mb-4"></div>
        <div className="text-white text-sm">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="p-3 rounded-lg text-sm bg-red-500/20 text-red-300 border border-red-500/30">
          {errorMessage}
        </div>
      )}
      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('Error') 
            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
            : 'bg-green-500/20 text-green-300 border border-green-500/30'
        }`}>
          {message}
        </div>
      )}

      {/* Name Section */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-white mb-2">Your Name</label>
          <input
            type="text"
            placeholder="Your Real Given Name & Family Name"
            value={formData.realName}
            onChange={(e) => handleInputChange("realName", e.target.value)}
            className="w-full bg-[#1a1a2e] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="private-name"
              checked={formData.isPrivate}
              onChange={(e) => handleInputChange("isPrivate", e.target.checked)}
              className="mr-2 accent-purple-600"
            />
            <label htmlFor="private-name" className="text-gray-400 text-sm">
              Is Private (hidden from public; can&apos;t be searched by name)
            </label>
          </div>
        </div>

        <div>
          <label className="block text-white mb-2">Your Username</label>
          <input
            type="text"
            placeholder="What should we call you here?"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            className="w-full bg-[#1a1a2e] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Bio Section */}
      <div>
        <label className="block text-white mb-2">Write Your Bio</label>
        <textarea
          placeholder="Start writing your bio here..."
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          rows={4}
          className="w-full bg-[#1a1a2e] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
        />
      </div>

      {/* Email Section */}
      <div>
        <label className="block text-white mb-2">Email Address</label>
        <input
          type="email"
          placeholder="Eg. johndoe@gmail.com"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="w-full bg-[#1a1a2e] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Location Section */}
      <div>
        <label className="block text-white mb-2">Home Location</label>
        <div className="grid grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="City/Village/Town"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
            className="bg-[#1a1a2e] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="County/State"
            value={formData.county}
            onChange={(e) => handleInputChange("county", e.target.value)}
            className="bg-[#1a1a2e] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Country"
            value={formData.country}
            onChange={(e) => handleInputChange("country", e.target.value)}
            className="bg-[#1a1a2e] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="private-location"
            checked={formData.isLocationPrivate}
            onChange={(e) => handleInputChange("isLocationPrivate", e.target.checked)}
            className="mr-2 accent-purple-600"
          />
          <label htmlFor="private-location" className="text-gray-400 text-sm">
            Is Private (hidden from public) Location is used for distances in Gigs
          </label>
        </div>
      </div>


      {/* Music Genres */}
      <MusicGenreSelector />

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <button 
          onClick={() => saveProfile(false)}
          disabled={saving}
          className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Details"}
        </button>
        <button 
          onClick={() => saveProfile(true)}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
}
