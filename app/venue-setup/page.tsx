"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { ProtectedRoute } from "../../lib/protected-route";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { MapPin, Calendar, Users, Building2, Music } from "lucide-react";

interface VenueProfile {
  id: string;
  venue_type: string;
  venue_name?: string;
  description?: string;
  established_date?: string;
  address?: string;
  capacity?: number;
  website?: string;
  social_links?: Record<string, string>;
}

export default function VenueSetup() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [venueProfile, setVenueProfile] = useState<VenueProfile | null>(null);
  const [formData, setFormData] = useState({
    venue_name: "",
    description: "",
    established_date: "",
    address: "",
    capacity: "",
    website: "",
    social_links: {
      instagram: "",
      twitter: "",
      facebook: ""
    }
  });

  useEffect(() => {
    if (!user) return;

    const loadVenueProfile = async () => {
      try {
        console.log('Loading venue profile from API...');

        // Get the venue profile from API
        const response = await fetch('/api/venue-profile');
        const result = await response.json();

        if (result.error) {
          if (result.error !== 'No venue profile found for user') {
            console.error('Error loading venue profile:', result);
            router.push('/upgrade?type=industry');
            return;
          }
          // No venue profile found - this is normal, we'll create one
          console.log('No venue profile found, will create new one');
          setVenueProfile(null);
        } else {
          setVenueProfile(result.data);
        }

      } catch (error) {
        console.error('Error in loadVenueProfile:', error);
      }
    };

    loadVenueProfile();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Save venue profile via API
      const response = await fetch('/api/venue-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          venue_name: formData.venue_name,
          description: formData.description,
          established_date: formData.established_date,
          address: formData.address,
          capacity: formData.capacity,
          website: formData.website,
          social_links: formData.social_links
        })
      });

      const result = await response.json();

      if (result.error) {
        console.error('Error saving venue profile:', result.error);
        return;
      }

      // Redirect to venue dashboard
      router.push('/venue-dashboard');

    } catch (error) {
      console.error('Error saving venue setup:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVenueTypeDisplay = (venueType: string) => {
    const types: Record<string, string> = {
      'public-live-music': 'Public Live Music Venue',
      'private-live-music': 'Private Live Music Venue',
      'dedicated-live-music': 'Dedicated Live Music Venue',
      'music-festival': 'Music Festival Venue',
      'music-promoter': 'Music Promoter',
      'fan-live-music': 'Fan Live Music Space'
    };
    return types[venueType] || venueType;
  };

  // Show loading while checking for user
  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {venueProfile ? 'Update Your Venue Profile' : 'Create Your Venue Profile'}
            </h1>
            <p className="text-gray-600 mb-4">
              {venueProfile
                ? `Update your ${getVenueTypeDisplay(venueProfile.venue_type)} profile`
                : 'Set up your venue profile to start hosting events'
              }
            </p>
            {venueProfile && (
              <Badge variant="secondary" className="text-sm">
                {getVenueTypeDisplay(venueProfile.venue_type)}
              </Badge>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Venue Information
                </CardTitle>
                <CardDescription>
                  Tell event organizers about your space
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue Name *
                  </label>
                  <Input
                    value={formData.venue_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                    placeholder="Your venue name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your venue, its atmosphere, unique features..."
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Established Date
                    </label>
                    <Input
                      type="date"
                      value={formData.established_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, established_date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Users className="w-4 h-4 inline mr-1" />
                      Capacity
                    </label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      placeholder="Maximum capacity"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Address *
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Full address of your venue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourvenue.com"
                    type="url"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Online Presence */}
            <Card>
              <CardHeader>
                <CardTitle>Online Presence</CardTitle>
                <CardDescription>
                  Help people find you online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram
                    </label>
                    <Input
                      value={formData.social_links.instagram}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        social_links: { ...prev.social_links, instagram: e.target.value }
                      }))}
                      placeholder="@yourvenue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facebook
                    </label>
                    <Input
                      value={formData.social_links.facebook}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        social_links: { ...prev.social_links, facebook: e.target.value }
                      }))}
                      placeholder="Your Facebook page"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/profile-setup')}
              >
                Back to Profile Types
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.venue_name}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
