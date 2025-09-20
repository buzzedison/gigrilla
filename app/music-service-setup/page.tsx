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
import { Briefcase, DollarSign, Clock, Star } from "lucide-react";

interface MusicServiceProfile {
  id: string;
  service_type: string;
  company_name?: string;
  description?: string;
  hourly_rate?: number;
  daily_rate?: number;
  years_experience?: number;
}

export default function MusicServiceSetup() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serviceProfile, setServiceProfile] = useState<MusicServiceProfile | null>(null);
  const [formData, setFormData] = useState({
    company_name: "",
    description: "",
    hourly_rate: "",
    daily_rate: "",
    years_experience: "",
    specializations: "",
    website: ""
  });

  useEffect(() => {
    if (!user) return;

    const loadServiceProfile = async () => {
      try {
        const supabase = createClient();

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .eq('profile_type', 'music-service')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading service profile:', error);
          router.push('/upgrade?type=industry');
          return;
        }

        if (profile) {
          setServiceProfile(profile);
        }

      } catch (error) {
        console.error('Error in loadServiceProfile:', error);
      }
    };

    loadServiceProfile();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const supabase = createClient();

      const profileData = {
        user_id: user.id,
        profile_type: 'music-service',
        company_name: formData.company_name || null,
        description: formData.description || null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        website: formData.website || null,
        is_published: true,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id,profile_type'
        });

      if (upsertError) {
        console.error('Error creating/updating service profile:', upsertError);
        return;
      }

      router.push('/service-dashboard');

    } catch (error) {
      console.error('Error saving service setup:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceTypeDisplay = (serviceType: string) => {
    const types: Record<string, string> = {
      'production': 'Music Production',
      'mixing-mastering': 'Mixing & Mastering',
      'recording': 'Recording Services',
      'songwriting': 'Songwriting',
      'session-musician': 'Session Musician',
      'music-education': 'Music Education',
      'sound-design': 'Sound Design'
    };
    return types[serviceType] || serviceType;
  };

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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {serviceProfile ? 'Update Your Music Service Profile' : 'Create Your Music Service Profile'}
            </h1>
            <p className="text-gray-600 mb-4">
              {serviceProfile
                ? `Update your ${getServiceTypeDisplay(serviceProfile.service_type)} profile`
                : 'Set up your music service profile to start offering services'
              }
            </p>
            {serviceProfile && (
              <Badge variant="secondary" className="text-sm">
                {getServiceTypeDisplay(serviceProfile.service_type)}
              </Badge>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Service Information
                </CardTitle>
                <CardDescription>
                  Tell clients about your services and expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company/Service Name *
                  </label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Your company or service name"
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
                    placeholder="Describe your services, expertise, and what makes you unique..."
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <Input
                      type="number"
                      value={formData.years_experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
                      placeholder="5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourservice.com"
                      type="url"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Hourly Rate (optional)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.hourly_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                      placeholder="50.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Daily Rate (optional)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.daily_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, daily_rate: e.target.value }))}
                      placeholder="400.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                disabled={loading || !formData.company_name}
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
