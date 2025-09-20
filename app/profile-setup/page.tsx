"use client";

import { useAuth } from "../../lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { ArrowLeft, Music, Building2, Briefcase, Users, Palette, ShoppingBag } from "lucide-react";
import Link from "next/link";

const profileTypes = [
  {
    id: 'artist',
    title: 'Artist Account',
    description: 'Create and manage your music, gigs, and fanbase',
    icon: Music,
    color: 'from-purple-600 to-pink-600',
    path: '/artist-setup'
  },
  {
    id: 'venue',
    title: 'Venue Account',
    description: 'List your venue, manage bookings, and host events',
    icon: Building2,
    color: 'from-blue-600 to-cyan-600',
    path: '/venue-setup'
  },
  {
    id: 'music-service',
    title: 'Music Service',
    description: 'Offer production, mixing, or music-related services',
    icon: Briefcase,
    color: 'from-green-600 to-emerald-600',
    path: '/music-service-setup'
  },
  {
    id: 'industry-pro',
    title: 'Industry Professional',
    description: 'Manager, agent, or music industry specialist',
    icon: Users,
    color: 'from-orange-600 to-red-600',
    path: '/industry-pro-setup'
  },
  {
    id: 'creative',
    title: 'Creative Professional',
    description: 'Designer, photographer, or other creative services',
    icon: Palette,
    color: 'from-indigo-600 to-purple-600',
    path: '/creative-setup'
  },
  {
    id: 'merchant',
    title: 'Merchandise Seller',
    description: 'Sell merchandise, tickets, or music-related products',
    icon: ShoppingBag,
    color: 'from-teal-600 to-green-600',
    path: '/merchant-setup'
  }
];

export default function ProfileSetupPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasArtistProfile, setHasArtistProfile] = useState<boolean | null>(null);
  const [creatingProfile, setCreatingProfile] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Check if user has an artist profile
  useEffect(() => {
    const checkArtistProfile = async () => {
      if (!user) return;

      try {
        console.log('ProfileSetup: Checking if user has artist profile...');
        const response = await fetch('/api/artist-profile');
        const result = await response.json();

        console.log('ProfileSetup: Artist profile API response:', {
          status: response.status,
          data: result.data,
          error: result.error,
          message: result.message
        });

        if (result.data) {
          console.log('ProfileSetup: User has artist profile, setting state to true');
          setHasArtistProfile(true);
        } else {
          console.log('ProfileSetup: User has no artist profile, setting state to false');
          setHasArtistProfile(false);
        }
      } catch (error) {
        console.error('ProfileSetup: Error checking artist profile:', error);
        setHasArtistProfile(false);
      }
    };

    checkArtistProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#4a2c5a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4a2c5a] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/fan-dashboard"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Switch Profile</h1>
          <p className="text-gray-300">
            Create additional profiles for different roles in the music industry.
            You can switch between your profiles at any time.
          </p>
        </div>

        {/* Profile Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profileTypes.map((profile) => {
            const IconComponent = profile.icon;
            return (
              <Card key={profile.id} className="bg-white/10 border-purple-500/20 hover:bg-white/15 transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${profile.color} flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg group-hover:text-purple-200 transition-colors">
                        {profile.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 mb-4">
                    {profile.description}
                  </CardDescription>
                  <Button
                    className={`w-full bg-gradient-to-r ${profile.color} hover:opacity-90 text-white`}
                    disabled={(profile.id === 'artist' && hasArtistProfile === null) || creatingProfile === profile.id}
                    onClick={async () => {
                      console.log('ProfileSetup: Button clicked for profile:', profile.id);
                      console.log('ProfileSetup: hasArtistProfile state:', hasArtistProfile);

                      if (profile.id === 'artist') {
                        if (hasArtistProfile) {
                          console.log('ProfileSetup: User has artist profile, navigating to dashboard');
                          // User has artist profile, go to dashboard
                          router.push('/artist-dashboard');
                        } else {
                          console.log('ProfileSetup: User has no artist profile, creating basic profile...');
                          setCreatingProfile('artist');
                          
                          try {
                            // Create a basic artist profile automatically
                            const response = await fetch('/api/artist-profile', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                stage_name: user?.email?.split('@')[0] || 'Artist',
                                bio: '',
                                established_date: '',
                                base_location: '',
                                members: '',
                                website: '',
                                social_links: {},
                                artist_type_id: null,
                                artist_sub_types: null
                              }),
                            });

                            const result = await response.json();

                            if (result.success) {
                              console.log('ProfileSetup: Artist profile created successfully');
                              setHasArtistProfile(true);
                              setCreatingProfile(null);
                              router.push('/artist-dashboard');
                            } else {
                              console.error('ProfileSetup: Failed to create artist profile:', result);
                              setCreatingProfile(null);
                              // Fallback to setup page if creation fails
                              router.push(profile.path);
                            }
                          } catch (error) {
                            console.error('ProfileSetup: Error creating artist profile:', error);
                            setCreatingProfile(null);
                            // Fallback to setup page if creation fails
                            router.push(profile.path);
                          }
                        }
                      } else {
                        console.log('ProfileSetup: Navigating to setup page for:', profile.id);
                        // For other profile types, go to their setup page
                        router.push(profile.path);
                      }
                    }}
                  >
                    {creatingProfile === profile.id
                      ? 'Creating Profile...'
                      : profile.id === 'artist' && hasArtistProfile === null
                      ? 'Checking...'
                      : profile.id === 'artist' && hasArtistProfile === true
                      ? 'Go to Artist Dashboard'
                      : `Create ${profile.title}`
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Information */}
        <div className="mt-12 bg-white/5 border border-purple-500/20 rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-3">About Switching Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h4 className="text-purple-300 font-medium mb-2">Multiple Profiles</h4>
              <p className="text-sm">
                You can create and manage multiple profile types. Each profile has its own
                dashboard, settings, and functionality tailored to that role.
              </p>
            </div>
            <div>
              <h4 className="text-purple-300 font-medium mb-2">Easy Switching</h4>
              <p className="text-sm">
                Use this page to switch between your different profiles or create new ones.
                Your fan profile will always remain active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
