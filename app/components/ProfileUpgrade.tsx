"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
// Removed Select components as they're not used in the current implementation
import { useAuth } from "../../lib/auth-context";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Music, Building2, Wrench, AlertCircle } from "lucide-react";

interface ProfileUpgradeProps {
  preSelectedRole?: string | null;
  onClose?: () => void;
}

export function ProfileUpgrade({ preSelectedRole, onClose }: ProfileUpgradeProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>(preSelectedRole || "");
  const [artistType, setArtistType] = useState<string>("");
  // Removed artistSubType as it's not used in current implementation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullFan, setIsFullFan] = useState<boolean | null>(null);
  const [isCheckingFanStatus, setIsCheckingFanStatus] = useState(true);

  const roleOptions = [
    {
      value: "artist",
      icon: <Music className="w-6 h-6" />,
      title: "Artist",
      description: "Create and perform music, upload tracks, book gigs",
      features: ["Upload unlimited music", "Book venues directly", "0% platform fees", "Fan analytics"]
    },
    {
      value: "venue",
      icon: <Building2 className="w-6 h-6" />,
      title: "Venue",
      description: "Host events, book artists, manage your venue",
      features: ["Discover artists", "Manage bookings", "Event promotion", "Revenue tracking"]
    },
    {
      value: "specialist",
      icon: <Wrench className="w-6 h-6" />,
      title: "Specialist",
      description: "Offer music services, build your reputation",
      features: ["Service marketplace", "Client management", "Portfolio showcase", "Review system"]
    }
  ];

  const artistTypeOptions = [
    {
      id: 1,
      value: "live-gig-original-recording",
      title: "Live Gig & Original Recording Artist",
      description: "I/we record original music AND perform live gigs",
      capabilities: ["Record original music", "Perform live gigs", "Venues can hire me", "Fans buy tickets", "Sell merchandise"]
    },
    {
      id: 2,
      value: "original-recording",
      title: "Original Recording Artist",
      description: "I/we record original music for streaming and download",
      capabilities: ["Record original music", "Stream/download sales", "Sell merchandise"]
    },
    {
      id: 3,
      value: "live-gig-cover",
      title: "Live Gig Artist (Cover/Tribute)",
      description: "I/we perform other people's music at live gigs",
      capabilities: ["Perform cover music", "Available for hire", "Fans buy tickets", "Sell merchandise"]
    },
    {
      id: 4,
      value: "vocalist-hire",
      title: "Vocalist for Hire",
      description: "I sing guest vocals, backing vocals, and session vocals",
      capabilities: ["Guest vocals", "Live backing vocals", "Recording sessions", "Join other artists"]
    },
    {
      id: 5,
      value: "instrumentalist-hire",
      title: "Instrumentalist for Hire",
      description: "I am a live performance and recording session musician",
      capabilities: ["Live performance", "Recording sessions", "Join other artists"]
    },
    {
      id: 6,
      value: "songwriter-hire",
      title: "Songwriter for Hire",
      description: "I write complete songs (lyrics + music) for other artists",
      capabilities: ["Write original songs", "Work with artists/labels", "Genre specialization"]
    },
    {
      id: 7,
      value: "lyricist-hire",
      title: "Lyricist for Hire",
      description: "I write lyrics for other artists and media",
      capabilities: ["Write song lyrics", "Work with artists/labels", "Genre specialization"]
    },
    {
      id: 8,
      value: "composer-hire",
      title: "Composer for Hire",
      description: "I compose music (melodies, harmonies, arrangements)",
      capabilities: ["Compose music", "Work with artists/labels", "Genre specialization"]
    }
  ];

  // Check if user is full fan on component mount
  useEffect(() => {
    const checkFullFanStatus = async () => {
      if (!user) {
        setIsCheckingFanStatus(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('user_profiles')
          .select('account_type')
          .eq('user_id', user.id)
          .eq('profile_type', 'fan')
          .single();

        if (error) {
          console.error('Error checking fan status:', error);
          setIsFullFan(false);
        } else {
          setIsFullFan(data?.account_type === 'full');
        }
      } catch (error) {
        console.error('Error in checkFullFanStatus:', error);
        setIsFullFan(false);
      } finally {
        setIsCheckingFanStatus(false);
      }
    };

    checkFullFanStatus();
  }, [user]);

  const handleUpgrade = async () => {
    if (!selectedRole || !user) return;

    // For artist profiles, require artist type selection
    if (selectedRole === 'artist' && !artistType) {
      setError('Please select an artist type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Create user profile for the new role (don't update user_role - keep it as 'fan')
      const profileData: Record<string, unknown> = {
        user_id: user.id,
        profile_type: selectedRole,
        is_public: true,
        is_published: false,
        created_at: new Date().toISOString()
      };

      // Add role-specific data
      if (selectedRole === 'artist' && artistType) {
        const selectedArtistType = artistTypeOptions.find(type => type.value === artistType);
        profileData.artist_type_id = selectedArtistType?.id || 1;
        profileData.artist_type = artistType;
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        setError(`Failed to create ${selectedRole} profile: ${profileError.message}`);
        setLoading(false);
        return;
      }

      // Success! Navigate to appropriate page
      if (selectedRole === 'artist') {
        // Artists go to comprehensive profile setup
        router.push('/artist-profile?section=biography');
      } else {
        router.push('/fan-dashboard'); // Other profiles go to dashboard
      }

    } catch (error) {
      console.error('Error upgrading profile:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper function removed as it's handled in the handleUpgrade function directly

  // Show loading while checking fan status
  if (isCheckingFanStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show Full Fan requirement if not full fan
  if (isFullFan === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-8 text-center">
          <div className="space-y-4">
            <AlertCircle className="w-16 h-16 text-purple-600 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-900">Full Fan Required</h1>
            <p className="text-lg text-gray-600">
              You need to upgrade to Full Fan before creating industry profiles.
            </p>
            <p className="text-gray-500">
              Full Fan unlocks streaming, playlists, commerce, social features, and the ability to create professional profiles.
            </p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={() => router.push('/upgrade?type=full-fan')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
            >
              Upgrade to Full Fan First
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/fan-dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-primary text-4xl">Add Industry Profile</h1>
          <p className="text-gray-600">
            Create a professional profile to showcase your music industry role
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Pre-selection Notice */}
        {preSelectedRole && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800 text-sm">
              Ready to create your <strong className="capitalize">{preSelectedRole}</strong> profile? 
              Select it below to get started, or choose a different option.
            </p>
          </div>
        )}

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {roleOptions.map((role) => (
            <Card 
              key={role.value}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedRole === role.value 
                  ? 'ring-2 ring-primary border-primary shadow-lg' 
                  : 'hover:border-primary/50'
              } ${
                preSelectedRole === role.value && selectedRole !== role.value
                  ? 'ring-2 ring-blue-300 border-blue-300 bg-blue-50/30'
                  : ''
              }`}
              onClick={() => setSelectedRole(role.value)}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto p-3 rounded-full ${
                  selectedRole === role.value ? 'bg-primary text-white' : 'bg-gray-100'
                }`}>
                  {role.icon}
                </div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  {role.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Artist Type Selection (only show if Artist is selected) */}
        {selectedRole === 'artist' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Choose Your Artist Type</h2>
              <p className="text-gray-600">Select the type that best describes your music activities</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {artistTypeOptions.map((type) => (
                <Card 
                  key={type.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    artistType === type.value 
                      ? 'ring-2 ring-primary border-primary shadow-md bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setArtistType(type.value)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {type.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {type.capabilities.slice(0, 3).map((capability, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                          {capability}
                        </li>
                      ))}
                      {type.capabilities.length > 3 && (
                        <li className="text-sm text-gray-500">
                          +{type.capabilities.length - 3} more capabilities
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            className="px-8 py-3"
            onClick={onClose}
            disabled={loading}
          >
            Stay as Fan
          </Button>
          <Button
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleUpgrade}
            disabled={!selectedRole || loading || (selectedRole === 'artist' && !artistType)}
          >
            {loading ? 'Upgrading...' : `Upgrade to ${selectedRole ? roleOptions.find(r => r.value === selectedRole)?.title : ''}`}
          </Button>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-gray-500">
          <p>You can always change your profile type later in settings</p>
        </div>
      </div>
    </div>
  );
}


