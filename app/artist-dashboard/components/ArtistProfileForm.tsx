"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Save, Rocket } from "lucide-react";

export function ArtistProfileForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    stage_name: "",
    established_date: "",
    hometown_city: "",
    hometown_county: "",
    hometown_country: "",
    gigs_performed: "",
    record_label_status: "",
    record_label_name: "",
    record_label_email: "",
    music_publisher_status: "",
    music_publisher_name: "",
    music_publisher_email: "",
    artist_manager_status: "",
    artist_manager_name: "",
    artist_manager_email: "",
    booking_agent_status: "",
    booking_agent_name: "",
    booking_agent_email: "",
    social_facebook: "",
    social_twitter: "",
    social_youtube: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save the profile data via API
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage_name: formData.stage_name,
          established_date: formData.established_date,
          base_location: `${formData.hometown_city}, ${formData.hometown_county}, ${formData.hometown_country}`,
          social_links: {
            facebook: formData.social_facebook,
            twitter: formData.social_twitter,
            youtube: formData.social_youtube
          }
        })
      });

      const result = await response.json();

      if (result.error) {
        console.error('Error saving artist profile:', result.error);
        return;
      }

      console.log('Artist profile saved successfully');
      router.push('/artist-dashboard');

    } catch (error) {
      console.error('Error saving artist profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          is_published: true
        })
      });

      const result = await response.json();

      if (result.error) {
        console.error('Error publishing artist profile:', result.error);
        return;
      }

      console.log('Artist profile published successfully');
      router.push('/artist-dashboard');

    } catch (error) {
      console.error('Error publishing artist profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Artist Stage Name */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Basic Information</h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Artist Stage Name</label>
              <Input
                value={formData.stage_name}
                onChange={(e) => handleInputChange('stage_name', e.target.value)}
                placeholder="What name do you go by?"
                className="max-w-md"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about your music and background..."
                rows={4}
                className="max-w-2xl"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Established Date</label>
                <Input
                  type="date"
                  value={formData.established_date}
                  onChange={(e) => handleInputChange('established_date', e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Base Location</label>
                <Input
                  value={formData.base_location}
                  onChange={(e) => handleInputChange('base_location', e.target.value)}
                  placeholder="City, Country"
                  className="max-w-md"
                />
              </div>
            </div>
          </div>

          {/* Artist Formed and Hometown */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Artist Formed</label>
              <Input
                type="date"
                value={formData.established_date}
                onChange={(e) => handleInputChange('established_date', e.target.value)}
                placeholder="mm/yyyy"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Hometown</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={formData.hometown_city}
                  onChange={(e) => handleInputChange('hometown_city', e.target.value)}
                  placeholder="City/Village/Town"
                />
                <Input
                  value={formData.hometown_county}
                  onChange={(e) => handleInputChange('hometown_county', e.target.value)}
                  placeholder="County/State"
                />
                <Input
                  value={formData.hometown_country}
                  onChange={(e) => handleInputChange('hometown_country', e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Public Gigs Performed */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Public Gigs Performed Before Joining Gigrilla
            </label>
            <Input
              value={formData.gigs_performed}
              onChange={(e) => handleInputChange('gigs_performed', e.target.value)}
              placeholder="XYZ"
            />
          </div>

          {/* Record Label Section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Record Label</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={formData.record_label_status} onValueChange={(value) => handleInputChange('record_label_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Signed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signed">Signed</SelectItem>
                    <SelectItem value="unsigned">Unsigned</SelectItem>
                    <SelectItem value="independent">Independent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Record Label Name</label>
                <Input
                  value={formData.record_label_name}
                  onChange={(e) => handleInputChange('record_label_name', e.target.value)}
                  placeholder="Start typing here..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Record Label Email Address</label>
                <Input
                  type="email"
                  value={formData.record_label_email}
                  onChange={(e) => handleInputChange('record_label_email', e.target.value)}
                  placeholder="info@company.com"
                />
              </div>
            </div>
          </div>

          {/* Music Publisher Section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Music Publisher</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={formData.music_publisher_status} onValueChange={(value) => handleInputChange('music_publisher_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Signed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="signed">Signed</SelectItem>
                    <SelectItem value="unsigned">Unsigned</SelectItem>
                    <SelectItem value="independent">Independent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Music Publisher Name</label>
                <Input
                  value={formData.music_publisher_name}
                  onChange={(e) => handleInputChange('music_publisher_name', e.target.value)}
                  placeholder="Start typing here..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Music Publisher Email Address</label>
                <Input
                  type="email"
                  value={formData.music_publisher_email}
                  onChange={(e) => handleInputChange('music_publisher_email', e.target.value)}
                  placeholder="info@company.com"
                />
              </div>
            </div>
          </div>

          {/* Artist Manager Section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Artist Manager</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={formData.artist_manager_status} onValueChange={(value) => handleInputChange('artist_manager_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Managed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="managed">Managed</SelectItem>
                    <SelectItem value="self-managed">Self-Managed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Artist Manager Name</label>
                <Input
                  value={formData.artist_manager_name}
                  onChange={(e) => handleInputChange('artist_manager_name', e.target.value)}
                  placeholder="Start typing here..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Artist Manager Email Address</label>
                <Input
                  type="email"
                  value={formData.artist_manager_email}
                  onChange={(e) => handleInputChange('artist_manager_email', e.target.value)}
                  placeholder="info@company.com"
                />
              </div>
            </div>
          </div>

          {/* Booking Agent Section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Agent</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={formData.booking_agent_status} onValueChange={(value) => handleInputChange('booking_agent_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Managed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="managed">Managed</SelectItem>
                    <SelectItem value="self-managed">Self-Managed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Booking Agent Name</label>
                <Input
                  value={formData.booking_agent_name}
                  onChange={(e) => handleInputChange('booking_agent_name', e.target.value)}
                  placeholder="Start typing here..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Booking Agent Email Address</label>
                <Input
                  type="email"
                  value={formData.booking_agent_email}
                  onChange={(e) => handleInputChange('booking_agent_email', e.target.value)}
                  placeholder="info@company.com"
                />
              </div>
            </div>
          </div>

          {/* Artist Social Media Accounts */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Social Media Accounts</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Facebook</label>
                <Input
                  value={formData.social_facebook}
                  onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                  placeholder="facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Twitter</label>
                <Input
                  value={formData.social_twitter}
                  onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                  placeholder="twitter.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">YouTube</label>
                <Input
                  value={formData.social_youtube}
                  onChange={(e) => handleInputChange('social_youtube', e.target.value)}
                  placeholder="youtube.com/..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex gap-4 justify-center">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Details'}
              </Button>
              <Button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                {loading ? 'Publishing...' : 'Publish Details'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
