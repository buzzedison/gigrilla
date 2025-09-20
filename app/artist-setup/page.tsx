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
import { Music, MapPin, Calendar, Users } from "lucide-react";

interface ArtistProfile {
  id: string;
  artist_type: string;
  stage_name?: string;
  bio?: string;
  established_date?: string;
  base_location?: string;
  members?: string[];
  genres?: string[];
}

export default function ArtistSetup() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [formData, setFormData] = useState({
    stage_name: "",
    bio: "",
    established_date: "",
    base_location: "",
    members: "",
    website: "",
    social_links: {
      instagram: "",
      twitter: "",
      youtube: "",
      spotify: ""
    }
  });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [availableGenres, setAvailableGenres] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    if (!user) return;

    const loadArtistProfile = async () => {
      try {
        console.log('Loading artist profile from API...');

        // First check if user is authenticated and has fan status
        const fanStatusResponse = await fetch('/api/fan-status');
        const fanStatusResult = await fanStatusResponse.json();

        console.log('Fan status API response:', {
          status: fanStatusResponse.status,
          statusText: fanStatusResponse.statusText,
          result: fanStatusResult
        });

        if (fanStatusResult.error) {
          console.error('Error checking fan status:', fanStatusResult);
          // If it's an auth error or empty error, redirect to login instead
          if (fanStatusResult.error === 'No user authenticated' ||
              fanStatusResult.error === 'Unauthorized' ||
              fanStatusResult.error === 'Internal server error' ||
              !fanStatusResult.error) {
            router.push('/login');
          } else {
            router.push('/upgrade?type=full-fan');
          }
          return;
        }

        if (fanStatusResult.data?.account_type !== 'full') {
          console.log('User is not a full fan, redirecting to upgrade');
          router.push('/upgrade?type=full-fan');
          return;
        }

        // Get the artist profile from API
        const response = await fetch('/api/artist-profile');
        const result = await response.json();

        console.log('Artist profile API response:', {
          status: response.status,
          statusText: response.statusText,
          result: result
        });

        if (result.error) {
          console.error('Error loading artist profile:', result);
          // Handle various "not found" scenarios
          if (result.error === 'No artist profile found for user' ||
              result.message === 'No artist profile found for user' ||
              result.error === 'No user authenticated' ||
              result.error === 'Unauthorized' ||
              !result.error) { // Empty error object case
            // No artist profile found - this is normal, we'll create one
            console.log('No artist profile found or auth issue, will create new one');
            setArtistProfile(null);
          } else {
            // Actual error - redirect to artist dashboard
            console.log('Actual error detected, redirecting to dashboard:', result.error);
            router.push('/artist-dashboard');
            return;
          }
        } else {
          setArtistProfile(result.data);
        }

        // Load available genres from API
        const genresResponse = await fetch('/api/genres');
        const genresResult = await genresResponse.json();

        if (genresResult.data && Array.isArray(genresResult.data)) {
          setAvailableGenres(genresResult.data.map((g: { id: number; name: string }) => ({ id: String(g.id), name: g.name })));
        }

      } catch (error) {
        console.error('Error in loadArtistProfile:', error);
        // On error, redirect to artist dashboard
        router.push('/artist-dashboard');
      }
    };

    loadArtistProfile();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      // Save artist profile via API
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage_name: formData.stage_name,
          bio: formData.bio,
          established_date: formData.established_date,
          base_location: formData.base_location,
          members: formData.members,
          website: formData.website,
          social_links: formData.social_links
        })
      });

      const result = await response.json();

      if (result.error) {
        console.error('Error saving artist profile:', result.error);
        return;
      }

      // Save selected genres via API
      if (selectedGenres.length > 0) {
        const genresResponse = await fetch('/api/user-genres', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ genres: selectedGenres })
        });

        const genresResult = await genresResponse.json();

        if (genresResult.error) {
          console.error('Error saving genres:', genresResult.error);
        }
      }

      // Refresh the artist profile data after creation/update
      await loadArtistProfile();

      // Redirect to artist dashboard
      router.push('/artist-dashboard');

    } catch (error) {
      console.error('Error saving artist setup:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const getArtistTypeDisplay = (artistType: string) => {
    const types: Record<string, string> = {
      'live-gig-original-recording': 'Live Gig & Original Recording Artist',
      'original-recording': 'Original Recording Artist',
      'live-gig-cover': 'Live Gig Artist (Cover/Tribute)',
      'vocalist-hire': 'Vocalist for Hire',
      'instrumentalist-hire': 'Instrumentalist for Hire',
      'songwriter-hire': 'Songwriter for Hire',
      'lyricist-hire': 'Lyricist for Hire',
      'composer-hire': 'Composer for Hire'
    };
    return types[artistType] || artistType;
  };

  // Show loading while checking for artist profile
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
              {artistProfile ? 'Update Your Artist Profile' : 'Create Your Artist Profile'}
            </h1>
            <p className="text-gray-600 mb-4">
              {artistProfile
                ? `Update your ${getArtistTypeDisplay(artistProfile.artist_type)} profile`
                : 'Set up your artist profile to get started'
              }
            </p>
            {artistProfile && (
              <Badge variant="secondary" className="text-sm">
                {getArtistTypeDisplay(artistProfile.artist_type)}
              </Badge>
            )}
          </div>

          {/* Info message for users who expected to go to dashboard */}
          {!artistProfile && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-5 h-5 text-blue-600" />
                <h3 className="text-blue-800 font-medium">Create Your Artist Profile</h3>
              </div>
              <p className="text-blue-700 text-sm">
                It looks like you don&apos;t have an artist profile yet. Fill out the form below to create your first artist profile,
                then you&apos;ll be able to access the artist dashboard.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Tell fans about your music and background
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage Name / Artist Name *
                  </label>
                  <Input
                    value={formData.stage_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, stage_name: e.target.value }))}
                    placeholder="Your stage name or band name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio / Description
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell your story, describe your music style, influences..."
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
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Base Location
                    </label>
                    <Input
                      value={formData.base_location}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                {/* Members field for bands/groups - shown for all since we don't know the type yet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    Band Members (optional)
                  </label>
                  <Input
                    value={formData.members}
                    onChange={(e) => setFormData(prev => ({ ...prev, members: e.target.value }))}
                    placeholder="Member 1, Member 2, Member 3..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple members with commas (leave empty for solo artists)</p>
                </div>
              </CardContent>
            </Card>

            {/* Genre Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Music Genres</CardTitle>
                <CardDescription>
                  Select the genres that best describe your music (select up to 5)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableGenres.slice(0, 20).map((genre) => (
                    <Badge
                      key={genre.id}
                      variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                      className="cursor-pointer justify-center py-2"
                      onClick={() => toggleGenre(genre.id)}
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
                {selectedGenres.length >= 5 && (
                  <p className="text-sm text-amber-600 mt-2">
                    Maximum 5 genres selected. Deselect some to choose others.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Online Presence */}
            <Card>
              <CardHeader>
                <CardTitle>Online Presence</CardTitle>
                <CardDescription>
                  Help fans find you online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourwebsite.com"
                    type="url"
                  />
                </div>

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
                      placeholder="@yourusername"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spotify
                    </label>
                    <Input
                      value={formData.social_links.spotify}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        social_links: { ...prev.social_links, spotify: e.target.value }
                      }))}
                      placeholder="Spotify artist URL"
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
                onClick={() => router.push('/fan-dashboard')}
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.stage_name}
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
