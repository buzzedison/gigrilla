"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../lib/auth-context";
import { LocationAutocompleteInput, type LocationSuggestion } from "../../components/ui/location-autocomplete";
// Genres moved to dedicated page: /fan-dashboard/genres

export function FanProfileForm() {
  const { user } = useAuth();
  const lastLoadedUserIdRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    realName: "",
    username: "",
    bio: "",
    email: "",
    homeLocation: "",
    city: "",
    county: "",
    country: "",
    isPrivate: true,
    isLocationPrivate: true
  });

  useEffect(() => {
    const currentUserId = user?.id ?? null;

    if (currentUserId) {
      if (lastLoadedUserIdRef.current === currentUserId) {
        return;
      }
      lastLoadedUserIdRef.current = currentUserId;
      loadUserProfile();
      return;
    }

    lastLoadedUserIdRef.current = null;
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Add effect to reload data when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        loadUserProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadUserProfile = async () => {
    setErrorMessage("");

    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Set up immediate fallback data from auth - be more aggressive about showing data
      const fallbackCity    = user.user_metadata?.city    || "";
      const fallbackCounty  = user.user_metadata?.county  || "";
      const fallbackCountry = user.user_metadata?.country || "";
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
        homeLocation: [fallbackCity, fallbackCounty, fallbackCountry].filter(Boolean).join(', '),
        city: fallbackCity,
        county: fallbackCounty,
        country: fallbackCountry,
        isPrivate: user.user_metadata?.name_private !== false, // default to true
        isLocationPrivate: user.user_metadata?.location_private !== false // default to true
      };

      setFormData(fallbackData);
      // Immediately unblock UI after fallback so refresh doesn't show loader
      setLoading(false);

      // Try to load enhanced data with retry logic
      try {
        // Use API endpoint instead of direct database query
        const apiPromise = fetch('/api/fan-profile')
          .then(response => response.json())
          .then(result => {
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

        if (profileError) {
          const errorObject = (profileError && typeof profileError === 'object')
            ? (profileError as { code?: string; message?: string })
            : null;
          const errorCode = typeof errorObject?.code === 'string' ? errorObject.code : '';
          const errorText = typeof errorObject?.message === 'string' ? errorObject.message : '';
          const hasMeaningfulError = Boolean(errorCode || errorText);

          const isExpected = !errorCode || errorCode === 'PGRST116' || errorCode === '42501' || errorCode === 'TIMEOUT';
          if (!isExpected) {
            console.error('FanProfileForm: Unexpected error loading profile data:', {
              code: errorCode,
              message: errorText
            });
            setErrorMessage('Unable to load your saved profile details right now. Using default values.');
          } else {
            console.log('FanProfileForm: No profile found or access issue, using fallback data:', errorCode || 'empty error');
          }
          return; // Use fallback data
        }

        if (profileData) {
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
                const loadedCity    = locationData.city    || prev.city;
                const loadedCounty  = locationData.county  || prev.county;
                const loadedCountry = locationData.country || prev.country;
                const loadedHomeLocation = [loadedCity, loadedCounty, loadedCountry]
                  .filter(Boolean)
                  .join(', ');

                const enhancedData: Partial<typeof prev> = {
                  username: (typedProfileData.username ?? typedProfileData.display_name) || prev.username,
                  bio: (typedProfileData.bio ?? undefined) ?? prev.bio,
                  city: loadedCity,
                  county: loadedCounty,
                  country: loadedCountry,
                  homeLocation: loadedHomeLocation,
                  isPrivate: (typedProfileData.privacy_settings?.name_private ?? prev.isPrivate ?? true) as boolean,
                  isLocationPrivate: (typedProfileData.privacy_settings?.location_private ?? prev.isLocationPrivate ?? true) as boolean,
                };
                return {
                  ...prev,
                  ...enhancedData,
                  realName: prev.realName,
                  email: prev.email
                };
              });
        } else {
          // Keep fallback data only.
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

  const handleInputChange = (field: string, value: string | boolean | null | undefined) => {
    setFormData(prev => {
      if (field === 'isPrivate' || field === 'isLocationPrivate') {
        return { ...prev, [field]: Boolean(value) };
      }

      const safeText = typeof value === 'string' ? value : '';
      return { ...prev, [field]: safeText };
    });
  };

  const saveProfile = async (publish = false) => {
    if (!user) return;

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch('/api/fan-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountType: 'guest',
          bio: formData.bio,
          isPublic: publish,
          username: formData.username,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: formData.email || user.email || '',
          address: [formData.city, formData.county, formData.country].filter(Boolean).join(', '),
          addressVisibility: formData.isLocationPrivate ? 'private' : 'public',
          locationDetails: {
            city: formData.city,
            county: formData.county,
            country: formData.country,
            address: [formData.city, formData.county, formData.country].filter(Boolean).join(', ')
          },
          privacySettings: {
            name_private: formData.isPrivate,
            location_private: formData.isLocationPrivate
          },
          phone: user.user_metadata?.phone || '',
          phoneVisibility: 'private',
          onboardingCompleted: publish ? true : undefined
        })
      })

      const result = await response.json()

      if (!response.ok || result?.error) {
        const normalized = {
          code: result?.code || 'UNKNOWN',
          message: result?.details || result?.error || 'No error message returned'
        }
        console.error('FanProfileForm: Save failed:', normalized)
        setErrorMessage(`Could not save your profile. ${normalized.message}`)
        return
      }

      setMessage(publish ? "Profile published successfully!" : "Profile saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error('FanProfileForm: Unexpected error saving profile:', error);
      setErrorMessage('Unexpected error saving your profile. Please try again.');
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
        <LocationAutocompleteInput
          value={formData.homeLocation ?? ''}
          placeholder="Start typing your city, postcode or address…"
          onInputChange={(val) => handleInputChange("homeLocation", val ?? '')}
          onSelect={(suggestion: LocationSuggestion) => {
            const city    = suggestion.city    ?? "";
            const county  = suggestion.state   ?? "";
            const country = suggestion.country ?? "";
            setFormData(prev => ({
              ...prev,
              city,
              county,
              country,
              homeLocation: [city, county, country].filter(Boolean).join(', '),
            }));
          }}
          inputClassName="bg-[#1a1a2e] border-gray-600 text-white placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:ring-0 rounded-lg px-4 py-3 h-auto"
        />
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
