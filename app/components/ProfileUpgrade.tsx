"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuth } from "../../lib/auth-context";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Music, Mic, Building2, Wrench } from "lucide-react";

interface ProfileUpgradeProps {
  currentRole?: string;
  preSelectedRole?: string | null;
  onClose?: () => void;
}

export function ProfileUpgrade({ currentRole = 'fan', preSelectedRole, onClose }: ProfileUpgradeProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>(preSelectedRole || "");
  const [artistType, setArtistType] = useState<string>("");
  const [loading, setLoading] = useState(false);

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

  const handleUpgrade = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);
    try {
      const supabase = createClient();
      
      // Update user role
      const { error: userError } = await supabase
        .from('users')
        .update({ user_role: selectedRole })
        .eq('id', user.id);

      if (userError) {
        console.error('Error updating user role:', userError);
        setLoading(false);
        return;
      }

      // Create user profile for the new role
      const profileData: any = {
        user_id: user.id,
        profile_type: selectedRole,
        is_public: true,
        is_published: false
      };

      // Add role-specific data
      if (selectedRole === 'artist' && artistType) {
        profileData.artist_type_id = getArtistTypeId(artistType);
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        setLoading(false);
        return;
      }

      // Success! Navigate to appropriate page
      if (selectedRole === 'artist') {
        router.push('/genres'); // Artists need to set genres
      } else {
        router.push('/dashboard'); // Venues/Specialists go straight to dashboard
      }

    } catch (error) {
      console.error('Error upgrading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map artist type strings to IDs (same as in auth-context)
  const getArtistTypeId = (artistType: string): number => {
    const mapping: Record<string, number> = {
      'live-gig-original-recording': 1,
      'original-recording': 2,
      'live-gig': 3,
      'vocalist-hire': 4,
      'instrumentalist-hire': 5,
      'songwriter-hire': 6,
      'lyricist-hire': 7,
      'composer-hire': 8,
    };
    return mapping[artistType] || 1;
  };

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

        {/* Full Fan Upgrade Callout */}
        {!preSelectedRole && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              Not a Full Fan yet?
            </h3>
            <p className="text-purple-700 mb-4">
              Unlock streaming, playlists, commerce, and social features first with a Full Fan upgrade!
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/upgrade?type=full-fan'}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              Upgrade to Full Fan First
            </Button>
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
          <div className="max-w-md mx-auto">
            <label className="block text-sm text-gray-700 mb-2">Type of Artist</label>
            <Select onValueChange={setArtistType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your artist type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live-gig-original-recording">Live Gig & Original Recording Artist</SelectItem>
                <SelectItem value="original-recording">Original Recording Artist</SelectItem>
                <SelectItem value="live-gig">Live Gig Artist (Cover/Tribute/Classical)</SelectItem>
                <SelectItem value="vocalist-hire">Vocalist for Hire</SelectItem>
                <SelectItem value="instrumentalist-hire">Instrumentalist for Hire</SelectItem>
                <SelectItem value="songwriter-hire">Songwriter for Hire</SelectItem>
                <SelectItem value="lyricist-hire">Lyricist for Hire</SelectItem>
                <SelectItem value="composer-hire">Composer for Hire</SelectItem>
              </SelectContent>
            </Select>
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


