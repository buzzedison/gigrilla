"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { ProtectedRoute } from "../../lib/protected-route";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Music, 
  Upload, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings, 
  Eye,
  Plus,
  MapPin,
  Globe
} from "lucide-react";

interface ArtistProfile {
  id: string;
  artist_type: string;
  stage_name?: string;
  bio?: string;
  established_date?: string;
  base_location?: string;
  members?: string[];
  website?: string;
  social_links?: {
    instagram?: string;
    spotify?: string;
    youtube?: string;
    twitter?: string;
  };
  is_published: boolean;
  created_at: string;
}

export default function ArtistDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tracks: 0,
    plays: 0,
    followers: 0,
    gigs: 0
  });

  useEffect(() => {
    if (!user) return;

    const loadArtistData = async () => {
      try {
        const supabase = createClient();
        
        // Get the artist profile
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('profile_type', 'artist')
          .single();

        if (error || !profile) {
          console.error('Error loading artist profile:', error);
          // If no artist profile found, redirect to create one
          router.push('/upgrade?type=industry&role=artist');
          return;
        }

        setArtistProfile(profile);

        // TODO: Load actual stats from database
        // For now, using placeholder data
        setStats({
          tracks: 0,
          plays: 0,
          followers: 0,
          gigs: 0
        });

      } catch (error) {
        console.error('Error in loadArtistData:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArtistData();
  }, [user, router]);

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

  const canUploadMusic = (artistType: string) => {
    return ['live-gig-original-recording', 'original-recording'].includes(artistType);
  };

  const canBookGigs = (artistType: string) => {
    return ['live-gig-original-recording', 'live-gig-cover', 'vocalist-hire', 'instrumentalist-hire'].includes(artistType);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!artistProfile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center space-y-4">
            <Music className="w-16 h-16 text-gray-400 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">No Artist Profile Found</h1>
            <p className="text-gray-600">Create an artist profile to get started</p>
            <Button onClick={() => router.push('/upgrade?type=industry&role=artist')}>
              Create Artist Profile
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {artistProfile.stage_name || 'Artist Dashboard'}
                  </h1>
                  <div className="flex items-center space-x-3 mt-1">
                    <Badge variant="secondary">
                      {getArtistTypeDisplay(artistProfile.artist_type)}
                    </Badge>
                    {artistProfile.base_location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {artistProfile.base_location}
                      </div>
                    )}
                    {artistProfile.is_published && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Published
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/artists/${artistProfile.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Public Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/artist-setup')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Music className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tracks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.tracks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Plays</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.plays.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Followers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.followers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Upcoming Gigs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.gigs}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="gigs">Gigs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Get started with your artist profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {canUploadMusic(artistProfile.artist_type) && (
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => router.push('/upload')}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New Track
                      </Button>
                    )}
                    
                    {canBookGigs(artistProfile.artist_type) && (
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => router.push('/gigs/create')}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Gig Listing
                      </Button>
                    )}
                    
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/artist-setup')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>

                    {artistProfile.website && (
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => window.open(artistProfile.website, '_blank')}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Visit Website
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Profile Status */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Status</CardTitle>
                    <CardDescription>
                      Complete your profile to attract more fans
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Basic Info</span>
                        <Badge variant={artistProfile.stage_name ? "default" : "secondary"}>
                          {artistProfile.stage_name ? "Complete" : "Missing"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Biography</span>
                        <Badge variant={artistProfile.bio ? "default" : "secondary"}>
                          {artistProfile.bio ? "Complete" : "Missing"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Social Links</span>
                        <Badge variant={artistProfile.social_links?.instagram || artistProfile.social_links?.spotify ? "default" : "secondary"}>
                          {artistProfile.social_links?.instagram || artistProfile.social_links?.spotify ? "Complete" : "Missing"}
                        </Badge>
                      </div>

                      {canUploadMusic(artistProfile.artist_type) && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Music Uploads</span>
                          <Badge variant={stats.tracks > 0 ? "default" : "secondary"}>
                            {stats.tracks > 0 ? `${stats.tracks} tracks` : "No tracks"}
                          </Badge>
                        </div>
                      )}

                      <div className="pt-4">
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => router.push('/artist-setup')}
                        >
                          Complete Profile Setup
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="music" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Music</h2>
                {canUploadMusic(artistProfile.artist_type) && (
                  <Button onClick={() => router.push('/upload')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Track
                  </Button>
                )}
              </div>

              {!canUploadMusic(artistProfile.artist_type) ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Music Upload Not Available</h3>
                    <p className="text-gray-600">
                      Your artist type ({getArtistTypeDisplay(artistProfile.artist_type)}) doesn&apos;t include music uploading capabilities.
                    </p>
                  </CardContent>
                </Card>
              ) : stats.tracks === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tracks uploaded yet</h3>
                    <p className="text-gray-600 mb-4">
                      Upload your first track to start building your music catalog
                    </p>
                    <Button onClick={() => router.push('/upload')}>
                      Upload Your First Track
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Music catalog will be displayed here once tracks are uploaded
                </div>
              )}
            </TabsContent>

            <TabsContent value="gigs" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Gigs & Performances</h2>
                {canBookGigs(artistProfile.artist_type) && (
                  <Button onClick={() => router.push('/gigs/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Gig
                  </Button>
                )}
              </div>

              {!canBookGigs(artistProfile.artist_type) ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Gig Booking Not Available</h3>
                    <p className="text-gray-600">
                      Your artist type ({getArtistTypeDisplay(artistProfile.artist_type)}) focuses on {artistProfile.artist_type.includes('songwriter') ? 'songwriting' : 'composition'} services.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs scheduled</h3>
                    <p className="text-gray-600 mb-4">
                      Create your first gig listing or browse available venues
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => router.push('/gigs/create')}>
                        Create Gig Listing
                      </Button>
                      <Button variant="outline" onClick={() => router.push('/venues')}>
                        Browse Venues
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <h2 className="text-xl font-semibold">Analytics & Insights</h2>
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600">
                    Detailed analytics about your plays, followers, and engagement will be available here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
