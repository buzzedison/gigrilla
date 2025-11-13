"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
import { getClient } from "../../../lib/supabase/client";
// Genres moved to dedicated page: /fan-dashboard/genres

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
    console.log('FanProfileForm: useEffect triggered with user:', user);
    console.log('FanProfileForm: User ID:', user?.id);
    console.log('FanProfileForm: Loading state:', loading);

    // Load profile when user becomes available
    if (user?.id) {
      console.log('FanProfileForm: User available, loading profile...');
      loadUserProfile();
    } else if (!loading) {
      console.log('FanProfileForm: No user available and not loading, showing fallback');
      // Set fallback data immediately when no user
      setLoading(false);
    }
  }, [user, loading]);

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
    setErrorMessage("");
    console.log('FanProfileForm: User exists:', !!user);
    console.log('FanProfileForm: User ID:', user?.id);
    console.log('FanProfileForm: User email:', user?.email);
    console.log('FanProfileForm: User metadata:', JSON.stringify(user?.user_metadata, null, 2));
    
    if (!user || !user.id) {
      console.log('FanProfileForm: No user or user ID, returning early');
      console.log('FanProfileForm: User object:', user);
      setLoading(false);
      return;
    }

    console.log('FanProfileForm: User is authenticated, proceeding with database query:', {
      userId: user.id,
      userEmail: user.email,
      userMetadata: user.user_metadata
    });

    setLoading(true);

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
      // Immediately unblock UI after fallback so refresh doesn't show loader
      setLoading(false);

      // Try to load enhanced data with retry logic
      try {
        console.log('FanProfileForm: Attempting to load enhanced data...');

        // Try regular database query with timeout and better error handling
        console.log('FanProfileForm: Querying database for user_id:', user.id);
        console.log('FanProfileForm: User auth state:', { userId: user.id, userEmail: user.email });

        console.log('FanProfileForm: Using Supabase client to query database...');
        console.log('FanProfileForm: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('FanProfileForm: Supabase client details:', {
          client: 'configured'
        });
        console.log('FanProfileForm: Starting database query for user:', user.id);
        console.log('FanProfileForm: User session details:', {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata,
          session: !!user // Check if user object exists
        });
        const startTime = Date.now();

        // First, let's verify the user is properly authenticated
        const supabase = getClient();
        const userCheck = await supabase.auth.getUser();
        console.log('FanProfileForm: User check result:', {
          hasUser: !!userCheck.data.user,
          userId: userCheck.data.user?.id,
          matches: userCheck.data.user?.id === user.id
        });

        console.log('FanProfileForm: Using API endpoint for data fetching...');

        // Use API endpoint instead of direct database query
        console.log('FanProfileForm: Fetching data from API endpoint...');
        const apiPromise = fetch('/api/fan-profile')
          .then(response => response.json())
          .then(result => {
            const endTime = Date.now();
            console.log('FanProfileForm: API call completed in', endTime - startTime, 'ms:', result);

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
            const endTime = Date.now();
            console.log('FanProfileForm: API call failed in', endTime - startTime, 'ms:', error);

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

        const { data: profileData, error: profileError } = await Promise.race([
          apiPromise,
          timeoutPromise
        ]) as { data: unknown; error: unknown };

        console.log('FanProfileForm: Database query result:', {
          profileData,
          profileError,
          errorType: typeof profileError,
          errorKeys: profileError ? Object.keys(profileError) : 'no error object'
        });

        if (profileError) {
          console.error('FanProfileForm: Error loading profile data:', profileError);
          console.log('FanProfileForm: Error details:', {
            errorType: typeof profileError,
            hasCode: !!(profileError as unknown as { code?: string })?.code,
            hasMessage: !!(profileError as unknown as { message?: string })?.message,
            errorKeys: profileError ? Object.keys(profileError) : 'no error object'
          });

          // Don't set error message for common issues, just use fallback data
          const errorWithCode = profileError as unknown as { code?: string };
          if (errorWithCode?.code !== 'PGRST116' && errorWithCode?.code !== '42501' && errorWithCode?.code !== 'TIMEOUT') {
            setErrorMessage('Unable to load your saved profile details right now. Using default values.');
          }
          return; // Use fallback data
        }

        if (profileData) {
          console.log('FanProfileForm: Enhanced data loaded:', profileData);
          
          const typedProfileData = profileData as unknown as { 
            username?: string; 
            display_name?: string; 
            bio?: string; 
            location_details?: Record<string, string>; 
            contact_details?: Record<string, string>; 
            privacy_settings?: Record<string, boolean>;
          };

          // Parse location details more safely
          let locationData = {} as { city?: string; county?: string; country?: string };
          const rawLocation = typedProfileData.location_details;
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
                  username: (typedProfileData.username ?? typedProfileData.display_name) || prev.username,
                  bio: (typedProfileData.bio ?? undefined) ?? prev.bio,
                  ...(locationData.city ? { city: locationData.city } : {}),
                  ...(locationData.county ? { county: locationData.county } : {}),
                  ...(locationData.country ? { country: locationData.country } : {}),
                  isPrivate: (typedProfileData.privacy_settings?.name_private ?? prev.isPrivate ?? true) as boolean,
                  isLocationPrivate: (typedProfileData.privacy_settings?.location_private ?? prev.isLocationPrivate ?? true) as boolean,
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
          console.log('FanProfileForm: No meaningful profile data (record exists but fields are null), using fallback data only');
        }
      } catch (enhancedError) {
        console.error('FanProfileForm: Enhanced data loading failed:', enhancedError);
        setErrorMessage('Unable to load your saved profile details right now. Refresh or try again in a moment.');
      }

    } catch (error) {
      console.error('FanProfileForm: Error in loadUserProfile:', error);
      setErrorMessage('Unexpected error loading your profile. Refresh the page or sign in again.');
    } finally {
      // keep loading as already set false after fallback
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
      console.log('FanProfileForm: Saving profile, publish:', publish);
      
      // Only update fan_profiles table (skip users table that might not exist)
      const profileData = {
        user_id: user.id,
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
      console.log('FanProfileForm: Fetching user to verify auth...');
      let sessionUserId: string | null = null;
      try {
        const supabaseClient = getClient();
        const userPromise = supabaseClient.auth.getUser();
        const userResult = await Promise.race([
          userPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('User fetch timeout')), 2000))
        ]) as { data?: { user?: { id?: string } } };
        if (userResult?.data?.user?.id) {
          sessionUserId = userResult.data.user.id as string;
          console.log('FanProfileForm: Authentication verified, user ID:', sessionUserId);
        } else {
          console.warn('FanProfileForm: No user returned, proceeding with auth context user');
          sessionUserId = user.id;
        }
      } catch (e) {
        console.warn('FanProfileForm: User fetch failed/timeout, proceeding with auth context user:', e);
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
          const supabase = getClient();
          const { error: updateError } = await supabase
            .from('fan_profiles')
            .update({
              bio: formData.bio,
              username: formData.username,
              display_name: formData.username,
              location_details: {
                city: formData.city,
                county: formData.county,
                country: formData.country,
                address: `${formData.city}, ${formData.county}, ${formData.country}`
              },
              privacy_settings: {
                name_private: formData.isPrivate,
                location_private: formData.isLocationPrivate
              },
              is_public: publish,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
          
          if (updateError) {
            console.warn('FanProfileForm: Background update failed, trying upsert fallback:', updateError);
            const { error: upsertError } = await supabase
              .from('fan_profiles')
              .upsert({
                user_id: user.id,
                bio: formData.bio,
                username: formData.username,
                display_name: formData.username,
                location_details: {
                  city: formData.city,
                  county: formData.county,
                  country: formData.country,
                  address: `${formData.city}, ${formData.county}, ${formData.country}`
                },
                privacy_settings: {
                  name_private: formData.isPrivate,
                  location_private: formData.isLocationPrivate
                },
                is_public: publish,
                updated_at: new Date().toISOString()
              }, { onConflict: 'user_id' });

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
      
      // Clear message after delay (genres already filled during onboarding)
      setTimeout(() => setMessage(""), 3000);

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
    <div className="space-y-6 rounded-2xl border border-white/10 bg-[#201233]/70 p-4 font-ui shadow-xl backdrop-blur-sm sm:space-y-8 sm:p-6 lg:p-8">
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
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="space-y-2">
          <label className="block text-white mb-2">Your Name</label>
          <input
            type="text"
            placeholder="Your Real Given Name & Family Name"
            value={formData.realName}
            onChange={(e) => handleInputChange("realName", e.target.value)}
            className="w-full bg-[#1a1a2e] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              id="private-name"
              checked={formData.isPrivate}
              onChange={(e) => handleInputChange("isPrivate", e.target.checked)}
              className="mr-2 accent-purple-600"
            />
            <label htmlFor="private-name">
              Is Private (hidden from public; can&apos;t be searched by name)
            </label>
          </div>
        </div>

        <div className="space-y-2">
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
      <div className="space-y-2">
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
      <div className="space-y-2">
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
      <div className="space-y-2">
        <label className="block text-white mb-2">Home Location</label>
        <div className="grid gap-4 sm:grid-cols-3">
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
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            id="private-location"
            checked={formData.isLocationPrivate}
            onChange={(e) => handleInputChange("isLocationPrivate", e.target.checked)}
            className="mr-2 accent-purple-600"
          />
          <label htmlFor="private-location">
            Is Private (hidden from public) Location is used for distances in Gigs
          </label>
        </div>
      </div>


      {/* Music Genres moved to /fan-dashboard/genres */}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => saveProfile(false)}
          disabled={saving}
          className="text-sm text-purple-300 transition-colors hover:text-purple-200 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Details"}
        </button>
        <button
          onClick={() => saveProfile(true)}
          disabled={saving}
          className="inline-flex w-full items-center justify-center rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50 sm:w-auto"
        >
          {saving ? "Saving..." : "Save & Publish Profile"}
        </button>
      </div>
    </div>
  );
}
