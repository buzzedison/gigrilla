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
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const supabase = createClient();
      
      // Load user data
      const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name, username, display_name, email, location')
        .eq('id', user.id)
        .single();

      // Load fan profile data
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('bio, contact_details, location_details, privacy_settings')
        .eq('user_id', user.id)
        .eq('profile_type', 'fan')
        .single();

      if (userData) {
        setFormData(prev => ({
          ...prev,
          realName: userData.first_name && userData.last_name 
            ? `${userData.first_name} ${userData.last_name}` 
            : '',
          username: userData.username || userData.display_name || '',
          email: userData.email || '',
        }));
      }

      if (profileData) {
        setFormData(prev => ({
          ...prev,
          bio: profileData.bio || '',
          // Parse location if it exists
          ...(profileData.location_details?.address && (() => {
            const location = profileData.location_details.address;
            const parts = location.split(', ');
            return {
              city: parts[0] || '',
              county: parts[1] || '',
              country: parts[2] || '',
            };
          })()),
          // Parse privacy settings
          isPrivate: profileData.privacy_settings?.name_private ?? true,
          isLocationPrivate: profileData.privacy_settings?.location_private ?? true,
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
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

    try {
      const supabase = createClient();
      
      // Parse name
      const nameParts = formData.realName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Update users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          username: formData.username,
          display_name: formData.username,
          email: formData.email,
          location: `${formData.city}, ${formData.county}, ${formData.country}`.replace(/^,\s*|,\s*$/g, ''),
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // Update fan profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          profile_type: 'fan',
          bio: formData.bio,
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
        }, { onConflict: 'user_id,profile_type' });

      if (profileError) throw profileError;

      setMessage(publish ? "Profile published successfully!" : "Profile saved successfully!");
      setTimeout(() => setMessage(""), 3000);

    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage("Error saving profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
              Is Private (hidden from public; can't be searched by name)
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
          {saving ? "Publishing..." : "Publish Profile"}
        </button>
      </div>
    </div>
  );
}

