"use client";

import { useState, useEffect } from "react"
import { useAuth } from "../../../lib/auth-context"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { LocationAutocompleteInput, type LocationSuggestion } from "../../components/ui/location-autocomplete"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Save, Rocket, Loader2, Check, Info } from "lucide-react"

const normalizeLabelStatus = (value?: string | null) => {
  const normalized = value?.toString().trim().toLowerCase() ?? ''
  switch (normalized) {
    case 'signed':
    case 'signed to label':
      return 'signed'
    case 'unsigned':
    case 'seeking':
    case 'unsigned - seeking label':
    case 'unsigned_seeking':
      return 'unsigned_seeking'
    case 'independent':
    case 'self signed - independent':
    case 'self-signed':
    case 'self_signed':
      return 'independent'
    default:
      return ''
  }
}

interface ArtistProfileFormProps {
  onProfileSaved?: () => void
}

export function ArtistProfileForm({ onProfileSaved }: ArtistProfileFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [existingSocialLinks, setExistingSocialLinks] = useState<Record<string, string | null>>({})
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [artistTypeId, setArtistTypeId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    stage_name: "",
    established_date: "",
    hometown_city: "",
    hometown_county: "",
    hometown_country: "",
    gigs_performed: "",
    recording_session_gigs: "",
    performer_isni: "",
    creator_ipi_cae: "",
    website: "",
    record_label_status: "",
    record_label_name: "",
    record_label_contact_name: "",
    record_label_email: "",
    record_label_phone: "",
    music_publisher_status: "",
    music_publisher_name: "",
    music_publisher_contact_name: "",
    music_publisher_email: "",
    music_publisher_phone: "",
    artist_manager_status: "",
    artist_manager_name: "",
    artist_manager_contact_name: "",
    artist_manager_email: "",
    artist_manager_phone: "",
    booking_agent_status: "",
    booking_agent_name: "",
    booking_agent_contact_name: "",
    booking_agent_email: "",
    booking_agent_phone: "",
    gig_money_routing: "",
    social_facebook: "",
    social_twitter: "",
    social_youtube: "",
    social_instagram: "",
    social_snapchat: "",
    social_tiktok: "",
    bio: "",
    base_location: ""
  })

  useEffect(() => {
    if (!user) {
      setInitialLoading(false)
    }
  }, [user])


  useEffect(() => {
    if (!user) return

    const loadProfile = async () => {
      setInitialLoading(true)
      try {
        const response = await fetch('/api/artist-profile')
        const result = await response.json()

        if (!response.ok || !result?.data) {
          setInitialLoading(false)
          return
        }

        const profile = result.data as {
          artist_type_id?: number | null
          stage_name?: string | null
          established_date?: string | null
          base_location?: string | null
          hometown_city?: string | null
          hometown_state?: string | null
          hometown_country?: string | null
          gigs_performed?: string | number | null
          recording_session_gigs?: string | number | null
          performer_isni?: string | null
          creator_ipi_cae?: string | null
          website?: string | null
          record_label_status?: string | null
          record_label_name?: string | null
          record_label_contact_name?: string | null
          record_label_email?: string | null
          record_label_phone?: string | null
          music_publisher_status?: string | null
          music_publisher_name?: string | null
          music_publisher_contact_name?: string | null
          music_publisher_email?: string | null
          music_publisher_phone?: string | null
          artist_manager_status?: string | null
          artist_manager_name?: string | null
          artist_manager_contact_name?: string | null
          artist_manager_email?: string | null
          artist_manager_phone?: string | null
          booking_agent_status?: string | null
          booking_agent_name?: string | null
          booking_agent_contact_name?: string | null
          booking_agent_email?: string | null
          booking_agent_phone?: string | null
          bio?: string | null
          social_links?: Record<string, string | null> | null
        }

        const baseLocation = profile.base_location ?? ""
        const [city = "", county = "", country = ""] = baseLocation
          .split(',')
          .map(part => part.trim())

        const socialLinks = profile.social_links ?? {}

        setArtistTypeId(profile.artist_type_id ?? null)
        setExistingSocialLinks(socialLinks)
        setFormData(prev => ({
          ...prev,
          stage_name: profile.stage_name ?? "",
          established_date: profile.established_date ?? "",
          base_location: baseLocation,
          hometown_city: city,
          hometown_county: county,
          hometown_country: country,
          gigs_performed: profile.gigs_performed ? String(profile.gigs_performed) : "",
          recording_session_gigs: profile.recording_session_gigs ? String(profile.recording_session_gigs) : "",
          performer_isni: profile.performer_isni ?? "",
          creator_ipi_cae: profile.creator_ipi_cae ?? "",
          website: profile.website ?? "",
          record_label_status: normalizeLabelStatus(profile.record_label_status) || prev.record_label_status,
          bio: profile.bio ?? "",
          social_facebook: socialLinks.facebook ?? "",
          social_twitter: socialLinks.twitter ?? "",
          social_youtube: socialLinks.youtube ?? "",
          social_instagram: socialLinks.instagram ?? "",
          social_snapchat: socialLinks.snapchat ?? "",
          social_tiktok: socialLinks.tiktok ?? ""
        }))
      } catch (error) {
        console.error('Error loading artist profile for form:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadProfile()
  }, [user])

  useEffect(() => {
    if (!feedback) return

    const timer = setTimeout(() => setFeedback(null), 4000)
    return () => clearTimeout(timer)
  }, [feedback])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const applyLocationSuggestion = (suggestion: LocationSuggestion) => {
    const city = suggestion.city?.trim() ?? ''
    const state = suggestion.state?.trim() ?? ''
    const country = suggestion.country?.trim() ?? ''
    const formatted = suggestion.formatted?.trim()

    setFormData(prev => ({
      ...prev,
      base_location: formatted || [city, state, country].filter(Boolean).join(', '),
      hometown_city: city || prev.hometown_city,
      hometown_county: state || prev.hometown_county,
      hometown_country: country || prev.hometown_country
    }))
  }

  const applyHometownSuggestion = (suggestion: LocationSuggestion) => {
    const city = suggestion.city?.trim() ?? ''
    const state = suggestion.state?.trim() ?? ''
    const country = suggestion.country?.trim() ?? ''
    const formatted = suggestion.formatted?.trim()

    setFormData(prev => ({
      ...prev,
      hometown_city: city || prev.hometown_city,
      hometown_county: state || prev.hometown_county,
      hometown_country: country || prev.hometown_country,
      base_location: prev.base_location || formatted || [city, state, country].filter(Boolean).join(', ')
    }))
  }

  const buildBaseLocation = () => {
    if (formData.base_location.trim()) {
      return formData.base_location.trim()
    }

    const parts = [formData.hometown_city, formData.hometown_county, formData.hometown_country]
      .map(part => part.trim())
      .filter(Boolean)

    return parts.join(', ')
  }

  const buildSocialLinks = () => ({
    ...existingSocialLinks,
    facebook: formData.social_facebook?.trim() || null,
    twitter: formData.social_twitter?.trim() || null,
    youtube: formData.social_youtube?.trim() || null,
    instagram: formData.social_instagram?.trim() || null,
    snapchat: formData.social_snapchat?.trim() || null,
    tiktok: formData.social_tiktok?.trim() || null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stage_name: formData.stage_name,
          bio: formData.bio,
          established_date: formData.established_date,
          base_location: buildBaseLocation(),
          hometown_city: formData.hometown_city,
          hometown_state: formData.hometown_county,
          hometown_country: formData.hometown_country,
          gigs_performed: formData.gigs_performed,
          recording_session_gigs: formData.recording_session_gigs || null,
          performer_isni: formData.performer_isni || null,
          creator_ipi_cae: formData.creator_ipi_cae || null,
          website: formData.website || null,
          social_links: buildSocialLinks()
        })
      })

      const result = await response.json()

      if (result.error) {
        console.error('Error saving artist profile:', result.error)
        setFeedback({ type: 'error', message: 'Something went wrong while saving. Please try again.' })
        return
      }

      console.log('Artist profile saved successfully')
      setExistingSocialLinks(buildSocialLinks())
      setFormData(prev => ({
        ...prev,
        base_location: buildBaseLocation()
      }))
      setFeedback({ type: 'success', message: 'Basic artist details saved.' })
      onProfileSaved?.()

    } catch (error) {
      console.error('Error saving artist profile:', error)
      setFeedback({ type: 'error', message: 'Unable to save artist details. Please check your connection and try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stage_name: formData.stage_name,
          bio: formData.bio,
          established_date: formData.established_date,
          base_location: buildBaseLocation(),
          hometown_city: formData.hometown_city || null,
          hometown_state: formData.hometown_county || null,
          hometown_country: formData.hometown_country || null,
          gigs_performed: formData.gigs_performed || null,
          social_links: buildSocialLinks(),
          is_published: true
        })
      })

      const result = await response.json()

      if (result.error) {
        console.error('Error publishing artist profile:', result.error)
        setFeedback({ type: 'error', message: 'Publishing failed. Please try again.' })
        return
      }

      console.log('Artist profile published successfully')
      setExistingSocialLinks(buildSocialLinks())
      setFormData(prev => ({
        ...prev,
        base_location: buildBaseLocation()
      }))
      setFeedback({ type: 'success', message: 'Artist profile published.' })
      onProfileSaved?.()

    } catch (error) {
      console.error('Error publishing artist profile:', error)
      setFeedback({ type: 'error', message: 'Unable to publish right now. Please try again later.' })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 text-sm text-gray-600 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
          Loading artist profile…
        </div>
      </div>
    )
  }

  const artistTypeNames: Record<number, string> = {
    1: "Live Gig & Original Recording Artist",
    2: "Original Recording Artist",
    3: "Live Gig Artist (Cover; Tribute; Classical; Theatrical)",
    4: "Vocalist for Hire",
    5: "Instrumentalist for Hire",
    6: "Songwriter for Hire",
    7: "Lyricist for Hire",
    8: "Composer for Hire",
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6">
        {artistTypeId && (
          <div className="mb-4 rounded-lg px-4 py-3 bg-purple-50 border border-purple-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-purple-900">
                Your Artist Type: {artistTypeNames[artistTypeId] || `Type ${artistTypeId}`}
              </div>
              <div className="text-xs text-purple-700 mt-1">
                This determines what features and sections are available to you
              </div>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                // Trigger navigation to type section - this would need to be passed from parent
                alert("Click 'Artist Type & Config' in the sidebar to change your artist type")
              }}
              className="text-xs text-purple-600 hover:text-purple-800 underline whitespace-nowrap ml-4"
            >
              Change Type
            </a>
          </div>
        )}
        {feedback && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
          >
            {feedback.message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Artist Stage Name */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Artist Details</h2>
              <p className="text-sm text-gray-600">Essential information about your act - how you want to be known and where you&apos;re based</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Artist Stage Name</label>
              <Input
                value={formData.stage_name}
                onChange={(e) => handleInputChange('stage_name', e.target.value)}
                placeholder="What name do you go by?"
                className="max-w-md"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about your music and background..."
                rows={4}
                className="max-w-2xl"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Established Date</label>
                <Input
                  type="date"
                  value={formData.established_date}
                  onChange={(e) => handleInputChange('established_date', e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Base Location</label>
                <LocationAutocompleteInput
                  value={formData.base_location}
                  onInputChange={(val) => handleInputChange('base_location', val)}
                  onSelect={applyLocationSuggestion}
                  placeholder="Search for your base location"
                  className="max-w-md"
                />
              </div>
            </div>
          </div>

          {/* Artist Formed and Hometown */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Artist Formed</label>
              <Input
                type="date"
                value={formData.established_date}
                onChange={(e) => handleInputChange('established_date', e.target.value)}
                placeholder="mm/yyyy"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Hometown</label>
              <LocationAutocompleteInput
                value={[formData.hometown_city, formData.hometown_county, formData.hometown_country]
                  .filter(Boolean)
                  .join(', ')}
                onInputChange={(val) => {
                  const parts = val.split(',').map(part => part.trim())
                  setFormData(prev => ({
                    ...prev,
                    hometown_city: parts[0] ?? '',
                    hometown_county: parts[1] ?? '',
                    hometown_country: parts[2] ?? ''
                  }))
                }}
                onSelect={applyHometownSuggestion}
                placeholder="Search for hometown"
                className="w-full"
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={formData.hometown_city}
                  onChange={(e) => handleInputChange('hometown_city', e.target.value)}
                  placeholder="City/Village/Town"
                />
                <Input
                  value={formData.hometown_county}
                  onChange={(e) => handleInputChange('hometown_county', e.target.value)}
                  placeholder="County/State"
                />
                <Input
                  value={formData.hometown_country}
                  onChange={(e) => handleInputChange('hometown_country', e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Public Gigs Performed */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Public Gigs Performed Before Joining Gigrilla
            </label>
            <Input
              value={formData.gigs_performed}
              onChange={(e) => handleInputChange('gigs_performed', e.target.value)}
              placeholder="XYZ"
            />
          </div>


          {/* Gig Money Splits Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 space-y-5 border border-green-200">
            <div className="border-b border-green-200/50 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Gig Money Splits</h2>
              <p className="text-sm text-gray-600 mt-1">Configure how gig payments are distributed</p>
            </div>

            {/* Show Record Label routing option only if signed to a label */}
            {formData.record_label_status === 'signed' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-700 font-medium">
                  Since you&apos;re signed to a Record Label, please specify how gig money should be routed:
                </p>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition-colors">
                    <input
                      type="radio"
                      name="gigMoneyRouting"
                      value="via_label"
                      checked={formData.gig_money_routing === 'via_label'}
                      onChange={() => handleInputChange('gig_money_routing', 'via_label')}
                      className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">All Gig Money goes via our Record Label</span>
                      <p className="text-xs text-gray-500 mt-1">
                        When you book a Gig through Gigrilla, the Venue pays Gigrilla, then Gigrilla pays the Record Label for them to distribute accordingly. Gigrilla doesn&apos;t take a cut of your Gig money.
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200 cursor-pointer hover:bg-green-50 transition-colors">
                    <input
                      type="radio"
                      name="gigMoneyRouting"
                      value="direct_to_artist"
                      checked={formData.gig_money_routing === 'direct_to_artist'}
                      onChange={() => handleInputChange('gig_money_routing', 'direct_to_artist')}
                      className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900">All Gig Money goes directly to the Artist Team</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Gig money bypasses the Record Label and goes directly to the Artist Team members according to the splits configured below.
                      </p>
                    </div>
                  </label>
                </div>

                {formData.gig_money_routing && (
                  <Button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Gig Money Recipient
                  </Button>
                )}
              </div>
            )}

            {/* Show Artist Team Splits if not signed to label OR if direct_to_artist is selected */}
            {(formData.record_label_status !== 'signed' || formData.gig_money_routing === 'direct_to_artist') && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Artist Team Payment Splits</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    When you book a Gig through Gigrilla, the Venue pays Gigrilla, then Gigrilla pays the Artist Team according to these splits. Gigrilla doesn&apos;t take a cut of your Gig money. You keep 100% of your Gig money, and we pay the individuals their share, as set by you below.
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">
                      All money owed to the Artist&apos;s members must add-up to 100% below.
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">
                      Money owed to individuals will be held until they sign-up to Gigrilla.
                    </p>
                  </div>
                </div>

                {/* Percentage Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-100 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-700">0.00%</p>
                    <p className="text-xs text-green-600">Total % Assigned</p>
                  </div>
                  <div className="bg-amber-100 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-amber-700">100.00%</p>
                    <p className="text-xs text-amber-600">Total % Remaining</p>
                  </div>
                </div>

                {/* Team Member Splits - Placeholder for when crew is loaded */}
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <p className="text-gray-500 text-sm">
                    Your Artist Team members will appear here once you add them in the Artist Crew section.
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Each team member will have a percentage input field to configure their share of gig payments.
                  </p>
                </div>

                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Gig Money Splits
                </Button>
              </div>
            )}

            {/* Show message if signed to label but no routing selected */}
            {formData.record_label_status === 'signed' && !formData.gig_money_routing && (
              <p className="text-sm text-gray-500 italic">
                Please select a gig money routing option above to configure payment splits.
              </p>
            )}
          </div>

          {/* Artist Social Media Accounts */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Social Media Accounts</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Facebook</label>
                <Input
                  value={formData.social_facebook}
                  onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                  placeholder="facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Twitter / X</label>
                <Input
                  value={formData.social_twitter}
                  onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                  placeholder="twitter.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">YouTube</label>
                <Input
                  value={formData.social_youtube}
                  onChange={(e) => handleInputChange('social_youtube', e.target.value)}
                  placeholder="youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Instagram</label>
                <Input
                  value={formData.social_instagram}
                  onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                  placeholder="instagram.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">TikTok</label>
                <Input
                  value={formData.social_tiktok}
                  onChange={(e) => handleInputChange('social_tiktok', e.target.value)}
                  placeholder="tiktok.com/@..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Snapchat</label>
                <Input
                  value={formData.social_snapchat}
                  onChange={(e) => handleInputChange('social_snapchat', e.target.value)}
                  placeholder="snapchat.com/add/..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex gap-4 justify-center">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Details'}
              </Button>
              <Button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                {loading ? 'Publishing...' : 'Publish Details'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
