"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "../../lib/auth-context";
import { useRouter } from "next/navigation";
import { Crown, Star, CreditCard, MapPin, Phone, User } from "lucide-react";
import { createClient } from "../../lib/supabase/client";

interface FullFanUpgradeProps {
  onClose?: () => void;
}

export function FullFanUpgrade({ onClose }: FullFanUpgradeProps) {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    dateOfBirth: "",
    address: "",
    phoneNumber: ""
  });

  // Load existing profile data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user) return;
      
      try {
        const supabase = createClient();
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('username, date_of_birth, contact_details, location_details')
          .eq('user_id', user.id)
          .eq('profile_type', 'fan')
          .single();

        if (error) {
          console.error('Error loading existing profile:', error);
          return;
        }

        if (profile) {
          console.log('FullFanUpgrade: Loading existing profile data:', profile);
          setFormData({
            username: profile.username || "",
            dateOfBirth: profile.date_of_birth || "",
            address: (profile.location_details as Record<string, unknown>)?.address as string || "",
            phoneNumber: (profile.contact_details as Record<string, unknown>)?.phoneNumber as string || ""
          });
        }
      } catch (error) {
        console.error('Error in loadExistingData:', error);
      }
    };

    loadExistingData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate required fields
    if (!formData.username || !formData.dateOfBirth || !formData.address || !formData.phoneNumber) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!user) {
      setError("You must be logged in to upgrade");
      setLoading(false);
      return;
    }

    try {
      console.log('FullFanUpgrade: Starting upgrade for user:', user.id);
      console.log('FullFanUpgrade: Form data:', formData);
      
      // Update the user's fan profile to full fan
      const profileData = {
        user_id: user.id,
        profile_type: 'fan',
        contact_details: {
          phoneNumber: formData.phoneNumber,
        },
        location_details: {
          address: formData.address,
        },
        username: formData.username,
        display_name: formData.username,
        date_of_birth: formData.dateOfBirth,
        account_type: 'full'
      };
      
      console.log('FullFanUpgrade: Profile data to update:', profileData);
      
      const result = await updateProfile(profileData);
      
      console.log('FullFanUpgrade: Update result:', result);

      if (result.error) {
        console.error('FullFanUpgrade: Update profile error:', result.error);
        // Check if the error indicates user is already upgraded
        const errorMessage = typeof result.error === 'object' && result.error && 'message' in result.error
          ? String((result.error as { message?: unknown }).message ?? '')
          : String(result.error ?? '')
        
        if (errorMessage.includes('already') || errorMessage.includes('exists')) {
          console.log('FullFanUpgrade: User appears to already be upgraded, redirecting to fan dashboard');
          router.push('/fan-dashboard');
          return;
        }
        setError(`Update failed: ${errorMessage || "Failed to upgrade profile"}`);
        return;
      }

      console.log('FullFanUpgrade: Upgrade successful, proceeding to payment setup');
      
      // Show success message and prompt for payment setup
      const setupPayments = window.confirm(
        'Upgrade successful! Welcome to Full Fan status.\n\n' +
        'To enable earning money and buying tickets/merchandise, would you like to set up payments now?\n\n' +
        'Click OK to set up Stripe Connect, or Cancel to do it later in settings.'
      );
      
      if (setupPayments) {
        // Simulate Stripe Connect flow
        setLoading(true);
        setError('');
        
        // Simulate API call to create Stripe Connect account
        setTimeout(() => {
          const success = Math.random() > 0.1; // 90% success rate for demo
          
          if (success) {
            alert('Payment setup successful! You can now earn money and make purchases on Gigrilla.');
          } else {
            setError('Payment setup failed. You can try again later in your settings.');
          }
          
          setLoading(false);
          
          // Navigate to dashboard regardless
          if (onClose) {
            onClose();
          }
          router.push('/fan-dashboard');
        }, 2000); // Simulate 2-second setup process
      } else {
        // Skip payment setup for now
        if (onClose) {
          onClose();
        }
        router.push('/fan-dashboard');
      }
    } catch (error) {
      console.error('FullFanUpgrade: Caught error:', error);
      setError(`Upgrade error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('FullFanUpgrade: Setting loading to false');
      // Ensure we never get stuck in loading state
      setTimeout(() => setLoading(false), 100);
    }
  };

  const fullFanFeatures = [
    {
      icon: <Star className="w-5 h-5" />,
      title: "Stream & Download Music",
      description: "Access unlimited music streaming and downloads"
    },
    {
      icon: <Crown className="w-5 h-5" />,
      title: "Create Playlists",
      description: "Build and share your favorite music collections"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Location Services",
      description: "Discover local events and connect with nearby artists"
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Commerce & Earning",
      description: "Buy tickets, merchandise, and earn money from activities"
    },
    {
      icon: <User className="w-5 h-5" />,
      title: "Social Features",
      description: "Comment, like, share, and message other users"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Full Control Panel",
      description: "Access all features and account management tools"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-primary text-4xl font-bold">Upgrade to Full Fan</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unlock the complete Gigrilla experience with streaming, social features, commerce tools, and more!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Features Overview */}
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                What You&apos;ll Get
              </CardTitle>
              <CardDescription>
                Full Fan members enjoy all the features that make Gigrilla special
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {fullFanFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="text-purple-600 mt-0.5">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Form */}
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                We need a few more details to unlock your Full Fan features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <Input
                    type="text"
                    placeholder="Choose a unique username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home Address *
                  </label>
                  <Textarea
                    placeholder="Street, City, Postal Code, Country"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for location services and legal contracts</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile/Cell Number *
                  </label>
                  <Input
                    type="tel"
                    placeholder="For 2FA and important reminders"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    required
                  />
                </div>

                {/* Payment details removed - will be handled in settings with Stripe Connect */}

                <div className="flex gap-3 pt-4">
                  {onClose && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={loading}
                      className="flex-1"
                    >
                      Maybe Later
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? "Upgrading..." : "Upgrade to Full Fan"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Full Fan upgrade is free! You can also add Artist, Venue, or Service profiles later.
          </p>
          <p className="text-xs text-gray-400">
            Your information is secure and used only as described in our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
