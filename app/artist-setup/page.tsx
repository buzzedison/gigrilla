"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { ProtectedRoute } from "../../lib/protected-route";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
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
        const supabase = createClient();
        
        // Get the artist profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('profile_type', 'artist')
          .single();

        if (error) {
          console.error('Error loading artist profile:', error);
          // If no artist profile found, redirect to upgrade
          router.push('/upgrade?type=industry');
          return;
        }

        setArtistProfile(profile);

        // Load available genres
        const { data: genres } = await supabase
          .from('genres')
          .select('id, name')
          .order('name');

        if (genres) {
          setAvailableGenres(genres.map(g => ({ id: String(g.id), name: g.name })));
        }

      } catch (error) {
        console.error('Error in loadArtistProfile:', error);
      }
    };

    loadArtistProfile();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !artistProfile) return;

    setLoading(true);

    try {
      const supabase = createClient();

      // Update artist profile with setup data
      const updateData = {
        stage_name: formData.stage_name || null,
        bio: formData.bio || null,
        established_date: formData.established_date || null,
        base_location: formData.base_location || null,
        members: formData.members ? formData.members.split(',').map(m => m.trim()) : null,
        website: formData.website || null,
        social_links: formData.social_links,
        is_published: true, // Mark as published once setup is complete
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', artistProfile.id);

      if (updateError) {
        console.error('Error updating artist profile:', updateError);
        return;
      }

      // Save selected genres
      if (selectedGenres.length > 0) {
        // First delete existing genre preferences for this profile
        await supabase
          .from('user_genre_preferences')
          .delete()
          .eq('user_id', user.id);

        // Insert new genre preferences
        const genreInserts = selectedGenres.map(genreId => ({
          user_id: user.id,
          genre_id: parseInt(genreId)
        }));

        const { error: genreError } = await supabase
          .from('user_genre_preferences')
          .insert(genreInserts);

        if (genreError) {
          console.error('Error saving genres:', genreError);
        }
      }

      // Redirect to comprehensive artist profile editor
      router.push('/artist-profile?section=basic-details');

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

  if (!artistProfile) {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Artist Profile</h1>
            <p className="text-gray-600 mb-4">
              Set up your {getArtistTypeDisplay(artistProfile.artist_type)} profile
            </p>
            <Badge variant="secondary" className="text-sm">
              {getArtistTypeDisplay(artistProfile.artist_type)}
            </Badge>
          </div>

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

                {/* Members field for bands/groups */}
                {(artistProfile.artist_type === 'live-gig-original-recording' || 
                  artistProfile.artist_type === 'original-recording' ||
                  artistProfile.artist_type === 'live-gig-cover') && (
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
                    <p className="text-xs text-gray-500 mt-1">Separate multiple members with commas</p>
                  </div>
                )}
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
