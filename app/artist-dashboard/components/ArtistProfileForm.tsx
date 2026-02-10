"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../../lib/auth-context"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { LocationAutocompleteInput, type LocationSuggestion } from "../../components/ui/location-autocomplete"
import { Save, Rocket, Loader2, Users, MapPin, Info } from "lucide-react"

interface ArtistProfileFormProps {
  onProfileSaved?: () => void
}

interface ArtistProfileData {
  artist_type_id?: number | null
  stage_name?: string | null
  established_date?: string | null
  performing_members?: number | null
  base_location?: string | null
  base_location_lat?: number | null
  base_location_lon?: number | null
  hometown_city?: string | null
  hometown_state?: string | null
  hometown_country?: string | null
  gigs_performed?: number | null
  facebook_url?: string | null
  instagram_url?: string | null
  threads_url?: string | null
  x_url?: string | null
  tiktok_url?: string | null
  youtube_url?: string | null
  snapchat_url?: string | null
  social_links?: Record<string, string | null> | null
}

interface FormData {
  stage_name: string
  established_month: string
  performing_members: string
  base_location: string
  hometown_city: string
  hometown_state: string
  hometown_country: string
  gigs_performed: string
  social_facebook: string
  social_instagram: string
  social_threads: string
  social_x: string
  social_tiktok: string
  social_youtube: string
  social_snapchat: string
}

const toMonthInput = (value?: string | null) => {
  if (!value) return ""
  const normalized = String(value).trim()
  return normalized.length >= 7 ? normalized.slice(0, 7) : ""
}

const monthToDate = (month: string) => {
  const trimmed = month.trim()
  if (!trimmed) return null
  return `${trimmed}-01`
}

const splitLocation = (value: string) => {
  const parts = value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)

  const city = parts[0] || ""
  const country = parts.length > 0 ? parts[parts.length - 1] : ""
  const state = parts.length > 2 ? parts[1] : ""

  return { city, state, country }
}

export function ArtistProfileForm({ onProfileSaved }: ArtistProfileFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [artistTypeId, setArtistTypeId] = useState<number | null>(null)
  const [existingSocialLinks, setExistingSocialLinks] = useState<Record<string, string | null>>({})
  const [baseLocationCoordinates, setBaseLocationCoordinates] = useState<{ lat: number | null; lon: number | null }>({
    lat: null,
    lon: null
  })
  const [formData, setFormData] = useState<FormData>({
    stage_name: "",
    established_month: "",
    performing_members: "1",
    base_location: "",
    hometown_city: "",
    hometown_state: "",
    hometown_country: "",
    gigs_performed: "",
    social_facebook: "",
    social_instagram: "",
    social_threads: "",
    social_x: "",
    social_tiktok: "",
    social_youtube: "",
    social_snapchat: ""
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

        const profile = result.data as ArtistProfileData
        const baseLocation = profile.base_location ?? ""
        const locationBits = splitLocation(baseLocation)
        const socialLinks = profile.social_links ?? {}

        setArtistTypeId(profile.artist_type_id ?? null)
        setExistingSocialLinks(socialLinks)
        setBaseLocationCoordinates({
          lat: typeof profile.base_location_lat === 'number' ? profile.base_location_lat : null,
          lon: typeof profile.base_location_lon === 'number' ? profile.base_location_lon : null
        })
        setFormData({
          stage_name: profile.stage_name ?? "",
          established_month: toMonthInput(profile.established_date),
          performing_members: profile.performing_members ? String(profile.performing_members) : "1",
          base_location: baseLocation,
          hometown_city: profile.hometown_city ?? locationBits.city,
          hometown_state: profile.hometown_state ?? locationBits.state,
          hometown_country: profile.hometown_country ?? locationBits.country,
          gigs_performed: profile.gigs_performed ? String(profile.gigs_performed) : "",
          social_facebook: profile.facebook_url ?? socialLinks.facebook ?? "",
          social_instagram: profile.instagram_url ?? socialLinks.instagram ?? "",
          social_threads: profile.threads_url ?? socialLinks.threads ?? "",
          social_x: profile.x_url ?? socialLinks.x ?? socialLinks.twitter ?? "",
          social_tiktok: profile.tiktok_url ?? socialLinks.tiktok ?? "",
          social_youtube: profile.youtube_url ?? socialLinks.youtube ?? "",
          social_snapchat: profile.snapchat_url ?? socialLinks.snapchat ?? ""
        })
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

  const handleInputChange = (field: keyof FormData, value: string) => {
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
      hometown_state: state || prev.hometown_state,
      hometown_country: country || prev.hometown_country
    }))

    setBaseLocationCoordinates({
      lat: typeof suggestion.lat === 'number' ? suggestion.lat : null,
      lon: typeof suggestion.lon === 'number' ? suggestion.lon : null
    })
  }

  const handleBaseLocationInputChange = (value: string) => {
    handleInputChange('base_location', value)
    setBaseLocationCoordinates({ lat: null, lon: null })
  }

  const buildBaseLocation = () => {
    if (formData.base_location.trim()) {
      return formData.base_location.trim()
    }

    return [formData.hometown_city, formData.hometown_state, formData.hometown_country]
      .map(part => part.trim())
      .filter(Boolean)
      .join(', ')
  }

  const buildSocialLinks = () => {
    const xValue = formData.social_x.trim() || null

    return {
      ...existingSocialLinks,
      facebook: formData.social_facebook.trim() || null,
      instagram: formData.social_instagram.trim() || null,
      threads: formData.social_threads.trim() || null,
      x: xValue,
      twitter: xValue,
      tiktok: formData.social_tiktok.trim() || null,
      youtube: formData.social_youtube.trim() || null,
      snapchat: formData.social_snapchat.trim() || null
    }
  }

  const buildPayload = (isPublished: boolean) => ({
    stage_name: formData.stage_name.trim() || null,
    established_date: monthToDate(formData.established_month),
    performing_members: formData.performing_members.trim() || null,
    base_location: buildBaseLocation() || null,
    base_location_lat: baseLocationCoordinates.lat,
    base_location_lon: baseLocationCoordinates.lon,
    hometown_city: formData.hometown_city.trim() || null,
    hometown_state: formData.hometown_state.trim() || null,
    hometown_country: formData.hometown_country.trim() || null,
    gigs_performed: formData.gigs_performed.trim() || null,
    facebook_url: formData.social_facebook.trim() || null,
    instagram_url: formData.social_instagram.trim() || null,
    threads_url: formData.social_threads.trim() || null,
    x_url: formData.social_x.trim() || null,
    tiktok_url: formData.social_tiktok.trim() || null,
    youtube_url: formData.social_youtube.trim() || null,
    snapchat_url: formData.social_snapchat.trim() || null,
    social_links: buildSocialLinks(),
    ...(isPublished ? { is_published: true } : {})
  })

  const persistProfile = async (isPublished: boolean) => {
    setLoading(true)

    try {
      const response = await fetch('/api/artist-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(buildPayload(isPublished))
      })

      const result = await response.json()

      if (result.error) {
        console.error('Error saving artist profile:', result.error)
        setFeedback({ type: 'error', message: isPublished ? 'Publishing failed. Please try again.' : 'Something went wrong while saving. Please try again.' })
        return
      }

      setExistingSocialLinks(buildSocialLinks())
      setFormData(prev => ({
        ...prev,
        base_location: buildBaseLocation()
      }))
      setFeedback({ type: 'success', message: isPublished ? 'Artist profile published.' : 'Basic artist details saved.' })
      onProfileSaved?.()
    } catch (error) {
      console.error('Error saving artist profile:', error)
      setFeedback({
        type: 'error',
        message: isPublished
          ? 'Unable to publish right now. Please try again later.'
          : 'Unable to save artist details. Please check your connection and try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await persistProfile(false)
  }

  const handlePublish = async () => {
    await persistProfile(true)
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
    8: "Composer for Hire"
  }

  const baseLocationDisplay = buildBaseLocation()
  const baseLocationBits = splitLocation(baseLocationDisplay)
  const cityState = [baseLocationBits.city, baseLocationBits.state].filter(Boolean).join(', ')

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6">
        {artistTypeId && (
          <div className="mb-4 rounded-lg px-4 py-3 bg-purple-50 border border-purple-200">
            <div className="text-sm font-semibold text-purple-900">
              Your Artist Type: {artistTypeNames[artistTypeId] || `Type ${artistTypeId}`}
            </div>
            <div className="text-xs text-purple-700 mt-1">
              This determines what features and sections are available to you.
            </div>
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
          <div id="artist-profile-details" className="bg-gray-50 rounded-lg p-4 space-y-4 scroll-mt-28">
            <div className="mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Artist Details</h2>
              <p className="text-sm text-gray-600">Populate and publish your Artist Profile so you can start making money.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Artist Stage Name</label>
              <Input
                value={formData.stage_name}
                onChange={(e) => handleInputChange('stage_name', e.target.value)}
                placeholder="Type the name you go by…"
                className="max-w-md"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Artist Formed (MM/YYYY)</label>
                <Input
                  type="month"
                  value={formData.established_month}
                  onChange={(e) => handleInputChange('established_month', e.target.value)}
                  className="max-w-md"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Number of Performing Members</label>
                <div className="relative max-w-xs">
                  <Users className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.performing_members}
                    onChange={(e) => handleInputChange('performing_members', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Artist Base Location</label>
              <LocationAutocompleteInput
                value={formData.base_location}
                onInputChange={handleBaseLocationInputChange}
                onSelect={applyLocationSuggestion}
                placeholder="Start typing address, town, or ZIP/postal code…"
                className="max-w-xl"
              />
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 flex gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-semibold">Displays on your Artist Profile as:</p>
                  <p>
                    {cityState && baseLocationBits.country
                      ? `${cityState}, ${baseLocationBits.country}`
                      : 'City/Town (+State) and Country will populate once your base location is entered.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Public Gigs Performed Before Joining Gigrilla</label>
              <Input
                type="number"
                min="0"
                step="1"
                value={formData.gigs_performed}
                onChange={(e) => handleInputChange('gigs_performed', e.target.value)}
                placeholder="It pays to be honest…"
                className="max-w-xs"
              />
            </div>
          </div>

          <div id="artist-profile-social" className="bg-gray-50 rounded-lg p-4 space-y-2 scroll-mt-28">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Artist Social Media Accounts</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Facebook URL</label>
                <Input
                  value={formData.social_facebook}
                  onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                  placeholder="facebook.com/artist"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Instagram URL</label>
                <Input
                  value={formData.social_instagram}
                  onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                  placeholder="instagram.com/artist"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Threads URL</label>
                <Input
                  value={formData.social_threads}
                  onChange={(e) => handleInputChange('social_threads', e.target.value)}
                  placeholder="threads.com/@artist"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">X URL</label>
                <Input
                  value={formData.social_x}
                  onChange={(e) => handleInputChange('social_x', e.target.value)}
                  placeholder="x.com/artist"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">TikTok URL</label>
                <Input
                  value={formData.social_tiktok}
                  onChange={(e) => handleInputChange('social_tiktok', e.target.value)}
                  placeholder="tiktok.com/@artist"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">YouTube URL</label>
                <Input
                  value={formData.social_youtube}
                  onChange={(e) => handleInputChange('social_youtube', e.target.value)}
                  placeholder="youtube.com/@artist"
                />
              </div>
              <div className="space-y-2 md:col-span-2 xl:col-span-3">
                <label className="text-sm font-medium text-gray-700">Snapchat URL</label>
                <Input
                  value={formData.social_snapchat}
                  onChange={(e) => handleInputChange('social_snapchat', e.target.value)}
                  placeholder="snapchat.com/add/artist"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 text-amber-600" />
            <div>
              <p className="font-semibold">Related Step 6 sections are handled in dedicated tabs:</p>
              <p>
                Artist Biography, Artist Payments, Artist Crew, Default Gig Royalty Splits, Artist Gig-Ability, and media uploads each have their own manager in the left sidebar.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex gap-4 justify-center">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Artist Details'}
              </Button>
              <Button
                type="button"
                onClick={handlePublish}
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <Rocket className="w-4 h-4" />
                {loading ? 'Publishing...' : 'Publish Artist Details'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
