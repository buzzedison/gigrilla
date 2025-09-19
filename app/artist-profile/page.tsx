"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { ProtectedRoute } from "../../lib/protected-route";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../components/ui/button";
// Removed unused Card components
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { 
  User, 
  Users, 
  FileText, 
  Music, 
  MapPin, 
  Image as ImageIcon, 
  Video, 
  Settings,
  Search,
  Bell,
  Menu,
  Upload,
  Plus,
  Edit,
  Facebook,
  Twitter,
  Youtube
} from "lucide-react";

interface ArtistProfile {
  id: string;
  user_id: string;
  stage_name?: string;
  bio?: string;
  established_date?: string;
  hometown_city?: string;
  hometown_state?: string;
  hometown_country?: string;
  gigs_performed?: number;
  record_label_status?: string;
  record_label_name?: string;
  record_label_email?: string;
  music_publisher_status?: string;
  music_publisher_name?: string;
  music_publisher_email?: string;
  artist_manager_status?: string;
  artist_manager_name?: string;
  artist_manager_email?: string;
  booking_agent_status?: string;
  booking_agent_name?: string;
  booking_agent_email?: string;
  facebook_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  is_published: boolean;
}

interface ArtistMember {
  id: string;
  first_name: string;
  nickname?: string;
  last_name: string;
  date_of_birth: string;
  roles: string[];
  income_share: number;
  display_age_on_profile: boolean;
}

export default function ArtistProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [activeSection, setActiveSection] = useState(searchParams.get('section') || 'biography');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [artistMembers, setArtistMembers] = useState<ArtistMember[]>([]);
  // Removed unused genre state variables

  // Form states for different sections
  const [biographyData, setBiographyData] = useState({
    bio: '',
    artwork_file: null as File | null
  });

  const [basicDetailsData, setBasicDetailsData] = useState({
    stage_name: '',
    established_date: '',
    hometown_city: '',
    hometown_state: '',
    hometown_country: '',
    gigs_performed: 0,
    record_label_status: 'Unsigned',
    record_label_name: '',
    record_label_email: '',
    music_publisher_status: 'Unsigned',
    music_publisher_name: '',
    music_publisher_email: '',
    artist_manager_status: 'Self-Managed',
    artist_manager_name: '',
    artist_manager_email: '',
    booking_agent_status: 'Self-Booking',
    booking_agent_name: '',
    booking_agent_email: '',
    facebook_url: '',
    twitter_url: '',
    youtube_url: ''
  });

  const [newMember, setNewMember] = useState({
    first_name: '',
    nickname: '',
    last_name: '',
    date_of_birth: '',
    roles: [] as string[],
    income_share: 0,
    display_age_on_profile: true
  });

  useEffect(() => {
    if (!user) return;
    loadArtistProfile();
  }, [user]);

  const loadArtistProfile = async () => {
    try {
      const supabase = createClient();
      
      // Get artist profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .eq('profile_type', 'artist')
        .single();

      if (error || !profile) {
        console.error('Error loading artist profile:', error);
        router.push('/upgrade?type=industry&role=artist');
        return;
      }

      setArtistProfile(profile);
      
      // Set form data from profile
      setBasicDetailsData({
        stage_name: profile.stage_name || '',
        established_date: profile.established_date || '',
        hometown_city: profile.hometown_city || '',
        hometown_state: profile.hometown_state || '',
        hometown_country: profile.hometown_country || '',
        gigs_performed: profile.gigs_performed || 0,
        record_label_status: profile.record_label_status || 'Unsigned',
        record_label_name: profile.record_label_name || '',
        record_label_email: profile.record_label_email || '',
        music_publisher_status: profile.music_publisher_status || 'Unsigned',
        music_publisher_name: profile.music_publisher_name || '',
        music_publisher_email: profile.music_publisher_email || '',
        artist_manager_status: profile.artist_manager_status || 'Self-Managed',
        artist_manager_name: profile.artist_manager_name || '',
        artist_manager_email: profile.artist_manager_email || '',
        booking_agent_status: profile.booking_agent_status || 'Self-Booking',
        booking_agent_name: profile.booking_agent_name || '',
        booking_agent_email: profile.booking_agent_email || '',
        facebook_url: profile.facebook_url || '',
        twitter_url: profile.twitter_url || '',
        youtube_url: profile.youtube_url || ''
      });

      setBiographyData({
        bio: profile.bio || '',
        artwork_file: null
      });

      // Calculate profile completion
      calculateProfileCompletion(profile);

      // Load genres
      const { data: genres } = await supabase
        .from('genres')
        .select('id, name, parent_id')
        .order('name');

      if (genres) {
        console.log('Loaded genres:', genres.length);
        // Genre loading logic removed for now
      }

      // TODO: Load artist members
      setArtistMembers([
        {
          id: '1',
          first_name: 'Ashton',
          nickname: 'Ashie',
          last_name: 'Kutcher',
          date_of_birth: '1985-02-20',
          roles: ['Lead Singer', 'Keyboardist'],
          income_share: 20,
          display_age_on_profile: true
        },
        {
          id: '2',
          first_name: 'Ashley',
          nickname: 'Katch',
          last_name: 'Katcher',
          date_of_birth: '1995-05-29',
          roles: ['Drummer'],
          income_share: 10,
          display_age_on_profile: false
        }
      ]);

    } catch (error) {
      console.error('Error in loadArtistProfile:', error);
    }
  };

  const calculateProfileCompletion = (profile: ArtistProfile) => {
    let completed = 0;
    const totalFields = 10;

    if (profile.stage_name) completed++;
    if (profile.bio) completed++;
    if (profile.established_date) completed++;
    if (profile.hometown_city) completed++;
    if (profile.facebook_url || profile.twitter_url || profile.youtube_url) completed++;
    // Add more completion criteria...

    setProfileCompletion(Math.round((completed / totalFields) * 100));
  };

  const saveBiography = async () => {
    if (!artistProfile) return;
    
    setLoading(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          bio: biographyData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', artistProfile.id);

      if (error) {
        console.error('Error saving biography:', error);
        return;
      }

      // Reload profile to update completion
      await loadArtistProfile();
      
    } catch (error) {
      console.error('Error in saveBiography:', error);
    } finally {
      setLoading(false);
    }
  };

  const publishBiography = async () => {
    await saveBiography();
    // Additional publish logic here
  };

  const saveBasicDetails = async () => {
    if (!artistProfile) return;
    
    setLoading(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...basicDetailsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', artistProfile.id);

      if (error) {
        console.error('Error saving basic details:', error);
        return;
      }

      await loadArtistProfile();
      
    } catch (error) {
      console.error('Error in saveBasicDetails:', error);
    } finally {
      setLoading(false);
    }
  };

  const publishDetails = async () => {
    await saveBasicDetails();
    // Additional publish logic here
  };

  const addGenre = () => {
    // Add genre logic
  };

  const saveGenres = async () => {
    // Save genres logic
  };

  const publishGenres = async () => {
    await saveGenres();
  };

  const addNewMember = () => {
    if (!newMember.first_name || !newMember.last_name) return;
    
    const member: ArtistMember = {
      id: Date.now().toString(),
      ...newMember
    };
    
    setArtistMembers(prev => [...prev, member]);
    setNewMember({
      first_name: '',
      nickname: '',
      last_name: '',
      date_of_birth: '',
      roles: [],
      income_share: 0,
      display_age_on_profile: true
    });
  };

  const sidebarSections = [
    { id: 'main-menu', icon: Menu, label: 'Main Menu', type: 'header' },
    { id: 'basic-details', icon: User, label: 'Basic Artist Details' },
    { id: 'members', icon: Users, label: 'Artist Members' },
    { id: 'biography', icon: FileText, label: 'Artist Biography', active: true },
    { id: 'genres', icon: Music, label: 'Artist Genres' },
    { id: 'gigability', icon: MapPin, label: 'Gigability Maps' },
    { id: 'artwork', icon: ImageIcon, label: 'Logo/Profile Artwork' },
    { id: 'photos', icon: ImageIcon, label: 'Photos' },
    { id: 'videos', icon: Video, label: 'Videos' },
    { id: 'change-type', icon: Settings, label: 'Change Artist Type' },
    { id: 'administration', label: 'ADMINISTRATION', type: 'header' },
    { id: 'view-profile', icon: User, label: 'View Profile' },
    { id: 'edit-profile', icon: Edit, label: 'Edit Profile' },
    { id: 'manage-admins', icon: Users, label: 'Manage Admins' },
    { id: 'billing', icon: Settings, label: 'Billing & Payments' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'biography':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">Write about Kenderick Lamar</h2>
              <Textarea
                value={biographyData.bio}
                onChange={(e) => setBiographyData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Start here..."
                className="min-h-[200px] bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Upload Your Artwork for The About Section</h3>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center bg-gray-800">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">Drag & Drop or</p>
                <p className="text-gray-300 mb-4">Click to Upload Your Artwork</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setBiographyData(prev => ({ ...prev, artwork_file: file }));
                    }
                  }}
                  className="hidden"
                  id="artwork-upload"
                />
                <label htmlFor="artwork-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Upload
                  </Button>
                </label>
              </div>
              {biographyData.artwork_file && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-white">{biographyData.artwork_file.name}</span>
                    <div className="w-32 bg-gray-600 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-gray-300 text-sm">60%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={saveBiography}
                disabled={loading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Save Biography
              </Button>
              <Button 
                onClick={publishBiography}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Publish Biography
              </Button>
            </div>
          </div>
        );

      case 'basic-details':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Artist Stage Name</h2>
              <Input
                value={basicDetailsData.stage_name}
                onChange={(e) => setBasicDetailsData(prev => ({ ...prev, stage_name: e.target.value }))}
                placeholder="What name do you go by?"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Artist Formed</h3>
                <Input
                  type="date"
                  value={basicDetailsData.established_date}
                  onChange={(e) => setBasicDetailsData(prev => ({ ...prev, established_date: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Hometown</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={basicDetailsData.hometown_city}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, hometown_city: e.target.value }))}
                    placeholder="City/Village/Town"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Input
                    value={basicDetailsData.hometown_state}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, hometown_state: e.target.value }))}
                    placeholder="County/State"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Input
                    value={basicDetailsData.hometown_country}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, hometown_country: e.target.value }))}
                    placeholder="Country"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Public Gigs Performed Before Joining Gigrilla</h3>
              <Input
                type="number"
                value={basicDetailsData.gigs_performed}
                onChange={(e) => setBasicDetailsData(prev => ({ ...prev, gigs_performed: parseInt(e.target.value) || 0 }))}
                placeholder="XYZ"
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 w-32"
              />
            </div>

            {/* Industry Contacts */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Record Label Status</label>
                  <Select value={basicDetailsData.record_label_status} onValueChange={(value) => setBasicDetailsData(prev => ({ ...prev, record_label_status: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Signed">Signed</SelectItem>
                      <SelectItem value="Unsigned">Unsigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Record Label Name</label>
                  <Input
                    value={basicDetailsData.record_label_name}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, record_label_name: e.target.value }))}
                    placeholder="Start typing here..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Record Label Email Address</label>
                  <Input
                    type="email"
                    value={basicDetailsData.record_label_email}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, record_label_email: e.target.value }))}
                    placeholder="info@company.com"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Music Publisher Status</label>
                  <Select value={basicDetailsData.music_publisher_status} onValueChange={(value) => setBasicDetailsData(prev => ({ ...prev, music_publisher_status: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Signed">Signed</SelectItem>
                      <SelectItem value="Unsigned">Unsigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Music Publisher Name</label>
                  <Input
                    value={basicDetailsData.music_publisher_name}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, music_publisher_name: e.target.value }))}
                    placeholder="Start typing here..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Music Publisher Email Address</label>
                  <Input
                    type="email"
                    value={basicDetailsData.music_publisher_email}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, music_publisher_email: e.target.value }))}
                    placeholder="info@company.com"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Artist Manager Status</label>
                  <Select value={basicDetailsData.artist_manager_status} onValueChange={(value) => setBasicDetailsData(prev => ({ ...prev, artist_manager_status: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Managed">Managed</SelectItem>
                      <SelectItem value="Self-Managed">Self-Managed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Artist Manager Name</label>
                  <Input
                    value={basicDetailsData.artist_manager_name}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, artist_manager_name: e.target.value }))}
                    placeholder="Start typing here..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Artist Manager Email Address</label>
                  <Input
                    type="email"
                    value={basicDetailsData.artist_manager_email}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, artist_manager_email: e.target.value }))}
                    placeholder="info@company.com"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Booking Agent Status</label>
                  <Select value={basicDetailsData.booking_agent_status} onValueChange={(value) => setBasicDetailsData(prev => ({ ...prev, booking_agent_status: value }))}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Managed">Managed</SelectItem>
                      <SelectItem value="Self-Booking">Self-Booking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Booking Agent Name</label>
                  <Input
                    value={basicDetailsData.booking_agent_name}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, booking_agent_name: e.target.value }))}
                    placeholder="Start typing here..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Booking Agent Email Address</label>
                  <Input
                    type="email"
                    value={basicDetailsData.booking_agent_email}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, booking_agent_email: e.target.value }))}
                    placeholder="info@company.com"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Artist Social Media Accounts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Facebook className="w-5 h-5 text-blue-500" />
                  <Input
                    value={basicDetailsData.facebook_url}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, facebook_url: e.target.value }))}
                    placeholder="facebook.com/..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <Input
                    value={basicDetailsData.twitter_url}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, twitter_url: e.target.value }))}
                    placeholder="twitter.com/..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <Input
                    value={basicDetailsData.youtube_url}
                    onChange={(e) => setBasicDetailsData(prev => ({ ...prev, youtube_url: e.target.value }))}
                    placeholder="youtube.com/..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={saveBasicDetails}
                disabled={loading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Save Details
              </Button>
              <Button 
                onClick={publishDetails}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Publish Details
              </Button>
            </div>
          </div>
        );

      case 'genres':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Add Your Music Genres</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Add Genre Family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select Genre Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alternative">Alternative</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select Sub-Genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="indie">Indie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={addGenre}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Genres
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Artist Genres</h3>
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Industrial/Gothic</h4>
                      <p className="text-gray-400 text-sm">Genre Group - Industrial Rock</p>
                      <p className="text-gray-400 text-sm">Sub-Genre - Metal</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Industrial/Gothic</h4>
                      <p className="text-gray-400 text-sm">Genre Group - Industrial Rock</p>
                      <p className="text-gray-400 text-sm">Sub-Genre - Metal</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={saveGenres}
                disabled={loading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Save Genres
              </Button>
              <Button 
                onClick={publishGenres}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Publish Genres
              </Button>
            </div>
          </div>
        );

      case 'members':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Artist Member Name</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                  value={newMember.first_name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="First Name"
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <Input
                  value={newMember.nickname}
                  onChange={(e) => setNewMember(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="Nickname"
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <Input
                  value={newMember.last_name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Last Name"
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                  <Input
                    type="date"
                    value={newMember.date_of_birth}
                    onChange={(e) => setNewMember(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  <div className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      id="display-age"
                      checked={newMember.display_age_on_profile}
                      onChange={(e) => setNewMember(prev => ({ ...prev, display_age_on_profile: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="display-age" className="text-sm text-gray-300">Display Age On Profile</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role(s)</label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead-singer">Lead Singer</SelectItem>
                      <SelectItem value="keyboardist">Keyboardist</SelectItem>
                      <SelectItem value="drummer">Drummer</SelectItem>
                      <SelectItem value="guitarist">Guitarist</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-1">Keyboardist, Lead Singer</p>
                  <Button 
                    size="sm" 
                    className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add New Role
                  </Button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Share of Income</label>
                  <Input
                    value={newMember.income_share}
                    onChange={(e) => setNewMember(prev => ({ ...prev, income_share: parseFloat(e.target.value) || 0 }))}
                    placeholder="xx.xx %"
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">can be edited later per Track/Gig</p>
                </div>
              </div>

              <Button 
                onClick={addNewMember}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Member
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Artist Members</h3>
              <div className="space-y-4">
                {artistMembers.map((member) => (
                  <div key={member.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">
                          {member.first_name} {member.nickname && `"${member.nickname}"`} {member.last_name}
                        </h4>
                        <p className="text-gray-400 text-sm">alias {member.nickname || member.first_name}</p>
                        <p className="text-gray-400 text-sm">{member.roles.join(', ')}</p>
                        <p className="text-gray-400 text-sm">
                          Date of Birth - {new Date(member.date_of_birth).toLocaleDateString()}
                        </p>
                        {member.display_age_on_profile ? (
                          <Badge variant="default" className="bg-blue-600 text-white text-xs">
                            Display Age On Profile
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                            Do Not Display Age On Profile
                          </Badge>
                        )}
                        <p className="text-gray-400 text-sm mt-1">{member.income_share}% Share of Income</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                disabled={loading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Save Members
              </Button>
              <Button 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Publish Members
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Section Under Construction</h2>
            <p className="text-gray-400">This section is being built. Please check back soon!</p>
          </div>
        );
    }
  };

  if (!artistProfile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <h1 className="text-xl font-semibold">EDIT PROFILE</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-gray-800 border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 w-64"
                />
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-gray-600 rounded-lg"></div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-900 border-r border-gray-700 min-h-screen">
            <div className="p-4 space-y-1">
              {sidebarSections.map((section) => {
                if (section.type === 'header') {
                  return (
                    <div key={section.id} className="px-3 py-2">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {section.label}
                      </h3>
                    </div>
                  );
                }

                const Icon = section.icon!;
                const isActive = activeSection === section.id || section.active;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-red-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex">
              <div className="flex-1 p-8">
                {renderContent()}
              </div>

              {/* Profile Completion Sidebar */}
              <div className="w-80 bg-gray-800 p-6 border-l border-gray-700">
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="w-24 h-24 rounded-full border-4 border-gray-600 flex items-center justify-center">
                      <div className="text-2xl">❓</div>
                    </div>
                    <div 
                      className="absolute inset-0 rounded-full border-4 border-purple-500"
                      style={{ 
                        background: `conic-gradient(#8b5cf6 ${profileCompletion * 3.6}deg, transparent 0deg)`,
                        mask: 'radial-gradient(circle at center, transparent 40px, black 42px)'
                      }}
                    ></div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Your Profile is {profileCompletion}% complete
                  </h3>
                  <h4 className="text-white font-medium">Kenderick Lamar</h4>
                  <p className="text-gray-400 text-sm italic">Recording Artist (Band)</p>
                  
                  <div className="flex justify-center space-x-2 mt-3">
                    <Facebook className="w-5 h-5 text-gray-400" />
                    <Twitter className="w-5 h-5 text-gray-400" />
                    <Youtube className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-300 font-medium">Est. May 2022</p>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">Artist Genre(s)</p>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">Record Label : Sounwave Studios</p>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">Music Publisher : Peny Barton</p>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">Artist Manager: Self-Managed</p>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">Booking Agent: Self- Booking</p>
                    <p className="text-gray-300 font-medium">Basic Gig Fee</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-white font-medium mb-3">Photos</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-square border-2 border-dashed border-gray-600 rounded flex items-center justify-center">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-white font-medium mb-3">Videos</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-square border-2 border-dashed border-gray-600 rounded flex items-center justify-center">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
