'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet'
import { ProtectedRoute } from '../../lib/protected-route'
import { useAuth } from '../../lib/auth-context'
import { ArtistSidebar } from '../artist-dashboard/components/ArtistSidebar'
import { getArtistSubTypeLabels } from '../../lib/artist-subtype-utils'
import { getArtistTypeConfig, type ArtistTypeCapabilities } from '../../data/artist-types'
import { formatDateDDMMMyyyy } from '../../lib/date-format'
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Camera,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Menu,
  Mic2,
  Music2,
  Pencil,
  PlayCircle,
  ShieldCheck,
  Users2,
  Waves,
} from 'lucide-react'

type ArtistProfileData = {
  artist_type_id?: number | null
  artist_sub_types?: string[] | Record<string, string[] | undefined> | null
  preferred_genre_ids?: string[] | null
  stage_name?: string | null
  bio?: string | null
  established_date?: string | null
  performing_members?: number | null
  base_location?: string | null
  hometown_city?: string | null
  hometown_state?: string | null
  hometown_country?: string | null
  gigs_performed?: number | null
  performer_isni?: string | null
  creator_ipi_cae?: string | null
  website?: string | null
  facebook_url?: string | null
  instagram_url?: string | null
  threads_url?: string | null
  x_url?: string | null
  tiktok_url?: string | null
  youtube_url?: string | null
  snapchat_url?: string | null
  mastodon_url?: string | null
  bluesky_url?: string | null
  record_label_status?: string | null
  record_label_name?: string | null
  music_publisher_status?: string | null
  music_publisher_name?: string | null
  artist_manager_status?: string | null
  artist_manager_name?: string | null
  booking_agent_status?: string | null
  booking_agent_name?: string | null
}

type ArtistProfileResponse = {
  data: ArtistProfileData | null
}

type ArtistPhoto = {
  id: string
  url: string
  caption?: string | null
  type: 'logo' | 'header' | 'photo'
  focus_x?: number | null
  focus_y?: number | null
  created_at: string
}

type ArtistVideo = {
  id: string
  title: string
  video_url: string
  thumbnail_url?: string | null
}

type ArtistMembersResponse = {
  invitations?: Array<{ id: string; status?: string | null }>
  activeMembers?: Array<{ id: string }>
  primaryRoles?: string[]
}

type GenreApiResponse = {
  data?: {
    families?: Array<{
      id: string
      name: string
      mainGenres: Array<{
        id: string
        name: string
        familyId: string
        subGenres: Array<{ id: string; name: string; typeId: string }>
      }>
    }>
  }
}

type GenreFamily = NonNullable<NonNullable<GenreApiResponse['data']>['families']>[number]

const formatEstablishedDate = (value?: string | null) => {
  if (!value) return 'Not added yet'
  return formatDateDDMMMyyyy(value, value)
}

const buildPublicLocation = (profile?: ArtistProfileData | null) => {
  if (!profile) return ''
  return [profile.hometown_city, profile.hometown_state, profile.hometown_country]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .join(', ')
}

const buildSocialLinks = (profile?: ArtistProfileData | null) => {
  if (!profile) return []

  return [
    { label: 'Website', value: profile.website },
    { label: 'Instagram', value: profile.instagram_url },
    { label: 'Facebook', value: profile.facebook_url },
    { label: 'Threads', value: profile.threads_url },
    { label: 'X', value: profile.x_url },
    { label: 'TikTok', value: profile.tiktok_url },
    { label: 'YouTube', value: profile.youtube_url },
    { label: 'Snapchat', value: profile.snapchat_url },
    { label: 'Mastodon', value: profile.mastodon_url },
    { label: 'Bluesky', value: profile.bluesky_url },
  ].filter((link): link is { label: string; value: string } => typeof link.value === 'string' && link.value.trim().length > 0)
}

const normaliseHref = (href: string) => {
  if (/^https?:\/\//i.test(href)) return href
  return `https://${href}`
}

const getHostnameLabel = (href: string) => {
  try {
    return new URL(normaliseHref(href)).hostname.replace(/^www\./, '')
  } catch {
    return href
  }
}

const clampHeaderFocusValue = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 50
  return Math.min(100, Math.max(0, value))
}

const getHeaderObjectPosition = (photo?: ArtistPhoto | null) =>
  `${clampHeaderFocusValue(photo?.focus_x)}% ${clampHeaderFocusValue(photo?.focus_y)}%`

const resolveGenreLabels = (genreIds: string[] | null | undefined, genreFamilies: GenreFamily[] | undefined) => {
  if (!genreIds?.length || !genreFamilies?.length) return []

  const labels: string[] = []
  for (const rawId of genreIds) {
    if (typeof rawId !== 'string' || !rawId.trim()) continue
    const [familyId, typeId, subId] = rawId.split(':')
    const family = genreFamilies.find((item: GenreFamily) => item.id === familyId)
    const mainGenre = family?.mainGenres.find((item) => item.id === typeId)
    const subGenre = subId ? mainGenre?.subGenres.find((item) => item.id === subId) : null

    if (family && mainGenre && subGenre) {
      labels.push(`${family.name}: ${mainGenre.name}: ${subGenre.name}`)
      continue
    }

    if (family && mainGenre) {
      labels.push(`${family.name}: ${mainGenre.name}`)
      continue
    }
  }

  return labels
}

function ArtistProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ArtistProfileData | null>(null)
  const [capabilities, setCapabilities] = useState<ArtistTypeCapabilities | null>(null)
  const [photos, setPhotos] = useState<ArtistPhoto[]>([])
  const [videos, setVideos] = useState<ArtistVideo[]>([])
  const [membersSummary, setMembersSummary] = useState<ArtistMembersResponse | null>(null)
  const [genreFamilies, setGenreFamilies] = useState<GenreFamily[]>([])

  useEffect(() => {
    if (!user) return

    const loadPage = async () => {
      setLoading(true)
      try {
        const [profileRes, photosRes, videosRes, membersRes, genresRes] = await Promise.all([
          fetch('/api/artist-profile'),
          fetch('/api/artist-photos'),
          fetch('/api/artist-videos'),
          fetch('/api/artist-members'),
          fetch('/api/genres'),
        ])

        const profileJson: ArtistProfileResponse = await profileRes.json()
        const photosJson = await photosRes.json()
        const videosJson = await videosRes.json()
        const membersJson: ArtistMembersResponse = await membersRes.json()
        const genresJson: GenreApiResponse = await genresRes.json()

        const nextProfile = profileJson?.data ?? null
        setProfile(nextProfile)
        setPhotos(Array.isArray(photosJson?.data) ? photosJson.data : [])
        setVideos(Array.isArray(videosJson?.data) ? videosJson.data : [])
        setMembersSummary(membersJson)
        setGenreFamilies(genresJson?.data?.families ?? [])

        if (nextProfile?.artist_type_id) {
          setCapabilities(getArtistTypeConfig(nextProfile.artist_type_id)?.capabilities ?? null)
        } else {
          setCapabilities(null)
        }
      } catch (error) {
        console.error('Error loading artist profile page:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [user])

  const headerImage = useMemo(() => photos.find((photo) => photo.type === 'header') ?? null, [photos])
  const logoImage = useMemo(() => photos.find((photo) => photo.type === 'logo') ?? null, [photos])
  const galleryPhotos = useMemo(() => photos.filter((photo) => photo.type === 'photo'), [photos])
  const socialLinks = useMemo(() => buildSocialLinks(profile), [profile])
  const publicLocation = useMemo(() => buildPublicLocation(profile), [profile])
  const subTypeLabels = useMemo(() => {
    if (!profile?.artist_type_id || !profile.artist_sub_types) return []
    return getArtistSubTypeLabels(profile.artist_sub_types, profile.artist_type_id)
  }, [profile])
  const genreLabels = useMemo(() => resolveGenreLabels(profile?.preferred_genre_ids, genreFamilies), [profile, genreFamilies])
  const activeMembersCount = membersSummary?.activeMembers?.length ?? 0
  const pendingInvitesCount = (membersSummary?.invitations ?? []).filter((invite) => invite.status !== 'accepted').length

  const routeToDashboard = (section: string, subSection?: string) => {
    const query = subSection
      ? `/artist-dashboard?section=${section}&subSection=${subSection}`
      : `/artist-dashboard?section=${section}`
    router.push(query)
  }

  const summaryCards = [
    {
      label: 'Artist Profile',
      value: profile?.stage_name?.trim() || 'Not added yet',
      meta: subTypeLabels.length ? subTypeLabels.join(' • ') : 'Artist basics and public display',
      icon: Mic2,
      action: () => routeToDashboard('profile', 'details'),
      actionLabel: 'Edit artist basics',
    },
    {
      label: 'Artist Media',
      value: `${galleryPhotos.length} photo${galleryPhotos.length === 1 ? '' : 's'} • ${videos.length} video${videos.length === 1 ? '' : 's'}`,
      meta: `${logoImage ? 'Logo set' : 'No logo'} • ${headerImage ? 'Header set' : 'No header'}`,
      icon: Camera,
      action: () => routeToDashboard('logo', 'logo'),
      actionLabel: 'Edit artwork',
    },
    {
      label: 'Artist Crew',
      value: `${activeMembersCount} active • ${pendingInvitesCount} pending`,
      meta: 'Roles, performers, support crew, and admins',
      icon: Users2,
      action: () => routeToDashboard('crew', 'manage-team'),
      actionLabel: 'Edit crew',
    },
    {
      label: 'Contract Status',
      value: [profile?.record_label_status, profile?.music_publisher_status, profile?.booking_agent_status].filter(Boolean).join(' • ') || 'Not completed yet',
      meta: 'Label, publisher, manager, and booking details',
      icon: ShieldCheck,
      action: () => routeToDashboard('contract', 'label'),
      actionLabel: 'Edit contract status',
    },
  ]

  const sections = [
    {
      title: 'Artist Basics',
      description: 'Fundamental artist details and public-facing identity.',
      icon: Music2,
      actionLabel: 'Edit artist basics',
      onEdit: () => routeToDashboard('profile', 'details'),
      content: (
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">Artist Name</dt>
            <dd className="mt-1 text-lg font-semibold text-white">{profile?.stage_name?.trim() || 'Not added yet'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">Artist Type</dt>
            <dd className="mt-1 text-white">{profile?.artist_type_id ? getArtistTypeConfig(profile.artist_type_id)?.name || 'Configured' : 'Not set yet'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">Artist Formed</dt>
            <dd className="mt-1 text-white">{formatEstablishedDate(profile?.established_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">Public Hometown</dt>
            <dd className="mt-1 text-white">{publicLocation || 'Not added yet'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">Base Location</dt>
            <dd className="mt-1 text-white">{profile?.base_location?.trim() || 'Not added yet'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">Public Gigs Performed</dt>
            <dd className="mt-1 text-white">{typeof profile?.gigs_performed === 'number' ? profile.gigs_performed : 'Not added yet'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">Performing Members</dt>
            <dd className="mt-1 text-white">{typeof profile?.performing_members === 'number' ? profile.performing_members : 'Not added yet'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">Identifiers</dt>
            <dd className="mt-1 text-white">
              {[profile?.performer_isni ? `ISNI ${profile.performer_isni}` : null, profile?.creator_ipi_cae ? `IPI ${profile.creator_ipi_cae}` : null].filter(Boolean).join(' • ') || 'No identifiers added yet'}
            </dd>
          </div>
        </dl>
      ),
    },
    {
      title: 'Biography',
      description: 'Long-form artist description and public summary.',
      icon: BookOpen,
      actionLabel: 'Edit biography',
      onEdit: () => routeToDashboard('bio', 'editor'),
      content: (
        <div className="space-y-4">
          <p className="max-w-4xl whitespace-pre-wrap text-base leading-7 text-[#eef0ff]">
            {profile?.bio?.trim() || 'No biography has been added yet.'}
          </p>
        </div>
      ),
    },
    {
      title: 'Genres',
      description: 'Saved artist genres from your artist profile.',
      icon: Waves,
      actionLabel: 'Edit genres',
      onEdit: () => routeToDashboard('genres', 'selector'),
      content: genreLabels.length ? (
        <div className="flex flex-wrap gap-2">
          {genreLabels.map((label) => (
            <Badge key={label} className="border-[#ffffff18] bg-[#ffffff10] px-3 py-1 text-sm text-[#f2edff]">
              {label}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-[#d7daf6]">No artist genres have been saved yet.</p>
      ),
    },
    {
      title: 'Media',
      description: 'Current profile artwork, gallery images, and videos.',
      icon: ImageIcon,
      actionLabel: 'Edit media',
      onEdit: () => routeToDashboard('logo', 'logo'),
      content: (
        <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-[#ffffff08] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">Header Artwork</p>
              <Button type="button" variant="outline" className="border-white/12 bg-transparent text-white hover:bg-white/10" onClick={() => routeToDashboard('logo', 'header')}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit header
              </Button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#140b1f]">
              {headerImage ? (
                <Image
                  src={headerImage.url}
                  alt="Artist header artwork"
                  width={1200}
                  height={400}
                  className="h-auto w-full aspect-[3/1] object-cover"
                  style={{ objectPosition: getHeaderObjectPosition(headerImage) }}
                />
              ) : (
                <div className="flex aspect-[3/1] items-center justify-center text-sm text-[#cbd0f2]">No header image uploaded yet</div>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-white/10 bg-[#ffffff08] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">Logo & Videos</p>
              <Button type="button" variant="outline" className="border-white/12 bg-transparent text-white hover:bg-white/10" onClick={() => routeToDashboard('videos', 'manage')}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit media
              </Button>
            </div>
            <div className="grid grid-cols-[80px,1fr] gap-4 rounded-2xl border border-white/10 bg-[#140b1f] p-4">
              {logoImage ? (
                <Image src={logoImage.url} alt="Artist logo" width={160} height={160} className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-xs text-[#cbd0f2]">No logo</div>
              )}
              <div className="space-y-2">
                <p className="text-white">{logoImage?.caption?.trim() || 'Artist logo / profile artwork'}</p>
                <p className="text-sm text-[#cbd0f2]">{galleryPhotos.length} gallery photos • {videos.length} video links</p>
              </div>
            </div>
            {videos.length > 0 && (
              <div className="space-y-2">
                {videos.slice(0, 3).map((video) => (
                  <div key={video.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#140b1f] px-4 py-3 text-sm text-white">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{video.title}</p>
                      <p className="truncate text-[#cbd0f2]">{getHostnameLabel(video.video_url)}</p>
                    </div>
                    <a href={normaliseHref(video.video_url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#ffd7e7] hover:text-white">
                      <PlayCircle className="h-4 w-4" />
                      Open
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Contracts & Links',
      description: 'Live contract status and public web links already saved for this artist.',
      icon: Globe,
      actionLabel: 'Edit links & contracts',
      onEdit: () => routeToDashboard('contract', 'label'),
      content: (
        <div className="grid gap-6 xl:grid-cols-[1fr,1.2fr]">
          <div className="space-y-3 rounded-3xl border border-white/10 bg-[#ffffff08] p-4">
            {[
              { label: 'Record Label', value: [profile?.record_label_status, profile?.record_label_name].filter(Boolean).join(' • ') },
              { label: 'Music Publisher', value: [profile?.music_publisher_status, profile?.music_publisher_name].filter(Boolean).join(' • ') },
              { label: 'Artist Manager', value: [profile?.artist_manager_status, profile?.artist_manager_name].filter(Boolean).join(' • ') },
              { label: 'Booking Agent', value: [profile?.booking_agent_status, profile?.booking_agent_name].filter(Boolean).join(' • ') },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-[#140b1f] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">{item.label}</p>
                <p className="mt-1 text-white">{item.value || 'Not added yet'}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 rounded-3xl border border-white/10 bg-[#ffffff08] p-4">
            {socialLinks.length ? (
              socialLinks.map((link) => (
                <a key={`${link.label}-${link.value}`} href={normaliseHref(link.value)} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#140b1f] px-4 py-3 text-white transition hover:bg-white/10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bfc0de]">{link.label}</p>
                    <p className="mt-1 text-sm text-[#eef0ff]">{getHostnameLabel(link.value)}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-[#ffd7e7]" />
                </a>
              ))
            ) : (
              <p className="text-[#d7daf6]">No artist web links have been added yet.</p>
            )}
          </div>
        </div>
      ),
    },
  ]

  return (
    <ProtectedRoute>
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent side="left" className="w-full max-w-[20rem] border-r border-white/8 bg-[linear-gradient(180deg,_#26122f_0%,_#211028_100%)] p-0 sm:max-w-sm">
          <SheetHeader className="sr-only">
            <SheetTitle>Artist profile navigation</SheetTitle>
          </SheetHeader>
          <ArtistSidebar
            activeSection="profile"
            activeSubSectionKey="profile:details"
            onSectionChange={(section) => {
              router.push(`/artist-dashboard?section=${section}`)
              setIsMobileNavOpen(false)
            }}
            onSubSectionChange={(section, subSection) => {
              router.push(`/artist-dashboard?section=${section}&subSection=${subSection}`)
              setIsMobileNavOpen(false)
            }}
            capabilities={capabilities}
            unreadMessages={0}
            completedSections={[]}
            hideTypeSection={false}
          />
        </SheetContent>

        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,143,163,0.14),_transparent_18%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.10),_transparent_20%),linear-gradient(180deg,_#3d214d_0%,_#331c42_100%)] lg:flex">
          <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:block lg:w-64">
            <ArtistSidebar
              activeSection="profile"
              activeSubSectionKey="profile:details"
              onSectionChange={(section) => router.push(`/artist-dashboard?section=${section}`)}
              onSubSectionChange={(section, subSection) => router.push(`/artist-dashboard?section=${section}&subSection=${subSection}`)}
              capabilities={capabilities}
              unreadMessages={0}
              completedSections={[]}
              hideTypeSection={false}
            />
          </div>

          <div className="flex-1 overflow-y-auto lg:pl-64">
            <div className="p-4 sm:p-6">
              <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
                <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#f7eef8] shadow-[0_30px_80px_rgba(14,10,28,0.28)]">
                  <div className="relative">
                    <div className="h-40 w-full bg-[linear-gradient(135deg,_rgba(112,43,143,0.92),_rgba(71,28,96,0.92))] sm:h-52">
                      {headerImage ? (
                        <Image
                          src={headerImage.url}
                          alt="Artist profile header"
                          fill
                          className="object-cover opacity-70"
                          style={{ objectPosition: getHeaderObjectPosition(headerImage) }}
                          sizes="(min-width: 1024px) 1200px, 100vw"
                        />
                      ) : null}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#120818]/95 via-[#120818]/72 to-transparent px-5 pb-5 pt-16 sm:px-8">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex items-end gap-4">
                          <div className="relative h-20 w-20 overflow-hidden rounded-3xl border-2 border-white/30 bg-white/10 shadow-lg sm:h-24 sm:w-24">
                            {logoImage ? (
                              <Image src={logoImage.url} alt="Artist logo" fill className="object-cover" sizes="96px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-white/80">
                                <ImageIcon className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                          <div className="pb-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="border-white/20 bg-white/12 text-[#ffe7f0]">Artist Profile</Badge>
                              {subTypeLabels.slice(0, 2).map((label) => (
                                <Badge key={label} className="border-white/20 bg-white/12 text-[#eef0ff]">{label}</Badge>
                              ))}
                            </div>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                              {profile?.stage_name?.trim() || 'Artist Profile'}
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#f1d9e9]">
                              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{publicLocation || 'No hometown added yet'}</span>
                              <span className="inline-flex items-center gap-2"><Bell className="h-4 w-4" />{profile?.artist_type_id ? getArtistTypeConfig(profile.artist_type_id)?.name || 'Artist type set' : 'Artist type not set'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/20 bg-white/10 text-white hover:bg-white/16 lg:hidden"
                            onClick={() => setIsMobileNavOpen(true)}
                          >
                            <Menu className="mr-2 h-4 w-4" />
                            Menu
                          </Button>
                          <Button type="button" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/16" onClick={() => router.push('/artist-dashboard?section=home')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to dashboard
                          </Button>
                          <Button type="button" className="bg-[#ff8fa3] text-[#321534] hover:bg-[#ff9fb0]" onClick={() => routeToDashboard('profile', 'details')}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </header>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {summaryCards.map((card) => {
                    const Icon = card.icon
                    return (
                      <button
                        key={card.label}
                        type="button"
                        onClick={card.action}
                        className="rounded-[1.75rem] border border-white/10 bg-[#f9f0fb] p-5 text-left shadow-[0_18px_36px_rgba(14,10,28,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_rgba(14,10,28,0.22)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#66799a]">{card.label}</p>
                            <p className="text-2xl font-bold leading-tight text-[#12172d]">{card.value}</p>
                            <p className="text-sm leading-6 text-[#4d5e7d]">{card.meta}</p>
                          </div>
                          <div className="rounded-2xl bg-[#f2d9e9] p-3 text-[#6b2d72]">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#6b2d72]">
                          {card.actionLabel}
                          <ExternalLink className="h-4 w-4" />
                        </div>
                      </button>
                    )
                  })}
                </div>

                {loading ? (
                  <div className="rounded-[2rem] border border-white/10 bg-[#f7eef8] p-10 text-center shadow-[0_30px_80px_rgba(14,10,28,0.2)]">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#6b2d72]" />
                    <p className="mt-4 text-[#4d5e7d]">Loading real artist profile data…</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sections.map((section) => {
                      const Icon = section.icon
                      return (
                        <section key={section.title} className="rounded-[2rem] border border-white/10 bg-[#f7eef8] p-6 shadow-[0_24px_60px_rgba(14,10,28,0.18)] sm:p-8">
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-4">
                              <div className="rounded-2xl bg-[#f2d9e9] p-3 text-[#6b2d72]">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-[#12172d]">{section.title}</h2>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#556684]">{section.description}</p>
                              </div>
                            </div>
                            <Button type="button" variant="outline" className="border-[#d5caea] bg-white text-[#4c2858] hover:bg-[#f8f2fc]" onClick={section.onEdit}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {section.actionLabel}
                            </Button>
                          </div>
                          <div className="mt-6 rounded-[1.5rem] bg-[linear-gradient(180deg,_#3a214a_0%,_#2f1b3d_100%)] p-5 text-white shadow-inner sm:p-6">
                            {section.content}
                          </div>
                        </section>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Sheet>
    </ProtectedRoute>
  )
}

export default ArtistProfilePage
