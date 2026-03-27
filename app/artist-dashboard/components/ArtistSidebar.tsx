"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  User,
  Users2,
  BarChart3,
  BookOpen,
  Music,
  Music2,
  Image as ImageIcon,
  Video,
  Settings,
  Eye,
  Edit3,
  CreditCard,
  RefreshCw,
  LogOut,
  ChevronDown,
  ChevronRight,
  FileText,
  Palette,
  CheckCircle2,
  DollarSign,
  Clock,
  Banknote,
  Megaphone,
  FileCheck,
  CalendarDays,
  Mail,
  Inbox,
  Plus,
  Edit,
  MessageSquare
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth-context";
import { ArtistTypeCapabilities } from "../../../data/artist-types";

export type ArtistDashboardSection =
  | 'home'
  | 'profile'
  | 'payments'
  | 'crew'
  | 'auditions'
  | 'royalty'
  | 'gigability'
  | 'gig-bookings'
  | 'gig-reporting'
  | 'gig-negotiations'
  | 'gig-planner'
  | 'gig-statistics'
  | 'gig-calendar'
  | 'gig-create'
  | 'gig-upcoming'
  | 'gig-past'
  | 'gig-invites'
  | 'gig-requests'
  | 'bio'
  | 'genres'
  | 'logo'
  | 'photos'
  | 'videos'
  | 'music-uploads'
  | 'music-catalogue'
  | 'music-statistics'
  | 'music-upload'
  | 'music-manage'
  | 'messages'
  | 'type'
  | 'contract'
  | 'settings'

interface ArtistSidebarProps {
  activeSection?: ArtistDashboardSection
  activeSubSectionKey?: string | null
  onSectionChange?: (section: ArtistDashboardSection) => void
  onSubSectionChange?: (section: ArtistDashboardSection, subSection: string) => void
  capabilities?: ArtistTypeCapabilities | null
  unreadMessages?: number
  completedSections?: string[]
  hideTypeSection?: boolean
  className?: string
}

function isSectionEnabled(section: ArtistDashboardSection, capabilities: ArtistTypeCapabilities | null | undefined, hideTypeSection?: boolean) {
  if (hideTypeSection && section === 'type') return false

  // Always allow type section (users can change their artist type anytime)
  if (section === 'type') return true

  if (!capabilities) {
    // Keep core navigation accessible before capabilities load.
    return section === 'home' || section === 'profile' || section === 'messages'
  }

  switch (section) {
    case 'gigability':
    case 'gig-bookings':
    case 'gig-reporting':
    case 'gig-negotiations':
    case 'gig-planner':
    case 'gig-statistics':
    case 'gig-calendar':
    case 'gig-create':
    case 'gig-upcoming':
    case 'gig-past':
    case 'gig-invites':
    case 'gig-requests':
      return capabilities.showGigAbility
    case 'music-uploads':
    case 'music-catalogue':
    case 'music-statistics':
    case 'music-upload':
    case 'music-manage':
      return capabilities.canUploadMusic
    default:
      return true
  }
}

type SidebarSubSection = {
  id: string
  label: string
}

const sectionSubSections: Partial<Record<ArtistDashboardSection, SidebarSubSection[]>> = {
  home: [
    { id: 'overview', label: 'Overview' }
  ],
  profile: [
    { id: 'details', label: 'Artist Basics' },
    { id: 'social', label: 'Artist Web Links' }
  ],
  payments: [
    { id: 'out', label: 'Money Out' },
    { id: 'in', label: 'Money In' }
  ],
  crew: [
    { id: 'owner', label: 'Your Roles & Info' },
    { id: 'add-members', label: 'Add Crew Member' },
    { id: 'manage-team', label: 'View Crew & Admins' }
  ],
  auditions: [
    { id: 'add', label: '+Create an Ad' },
    { id: 'manage', label: 'Published & Historic Ads' }
  ],
  contract: [
    { id: 'label', label: 'Record Label' },
    { id: 'publisher', label: 'Music Publisher' },
    { id: 'manager', label: 'Artist Manager' },
    { id: 'booking', label: 'Booking Agent' }
  ],
  royalty: [
    { id: 'overview', label: 'Overview' },
    { id: 'splits', label: 'Team Splits' }
  ],
  gigability: [
    { id: 'base', label: 'Base Location' },
    { id: 'sets', label: 'Set Lengths' },
    { id: 'fees', label: 'Gig Fees' },
    { id: 'local', label: 'Local Area' },
    { id: 'wider', label: 'Wider Area' }
  ],
  'gig-bookings': [
    { id: 'book-new', label: '+Book a New Gig' },
    { id: 'add-manually', label: '+Add Gig Manually' },
    { id: 'drafts', label: 'Draft Gigs' },
    { id: 'upcoming', label: 'Upcoming Gigs' },
    { id: 'scheduled-hidden', label: 'Scheduled / Hidden' },
    { id: 'historic', label: 'Historic Gigs' }
  ],
  'gig-reporting': [
    { id: 'confirm-gig', label: 'Confirm a Gig' },
    { id: 'report-venue', label: 'Report a Venue' }
  ],
  'gig-negotiations': [
    { id: 'gig_invites', label: 'Gig Invites' },
    { id: 'gig_requests', label: 'Gig Requests' },
    { id: 'confirmations', label: 'Confirmations' }
  ],
  'gig-planner': [
    { id: 'calendar', label: 'View Calendar' },
    { id: 'unavailability', label: '+Unavailability' }
  ],
  'gig-statistics': [
    { id: 'performed', label: 'Gigs Performed' },
    { id: 'locations', label: 'Gig Locations' },
    { id: 'venues', label: 'Gig Venues' },
    { id: 'earnings', label: 'Gig Earnings' }
  ],
  'gig-calendar': [
    { id: 'add', label: '+Book a New Gig' },
    { id: 'upcoming', label: '+Add Gig Manually' },
    { id: 'past', label: 'View Calendar' }
  ],
  'gig-invites': [
    { id: 'overview', label: 'Overview' },
    { id: 'pending', label: 'Pending Invites' },
    { id: 'history', label: 'Invite History' }
  ],
  'gig-requests': [
    { id: 'overview', label: 'Overview' },
    { id: 'pending', label: 'Pending Requests' },
    { id: 'history', label: 'Request History' }
  ],
  bio: [
    { id: 'editor', label: 'Artist Bio' }
  ],
  genres: [
    { id: 'selector', label: 'Artist Genres' }
  ],
  logo: [
    { id: 'logo', label: 'Logo' },
    { id: 'header', label: 'Header' }
  ],
  photos: [
    { id: 'gallery', label: 'Photos' }
  ],
  videos: [
    { id: 'upload', label: 'Videos' },
    { id: 'manage', label: 'Manage Video Links' }
  ],
  'music-upload': [
    { id: 'intro', label: 'Upload Intro' },
    { id: 'guide', label: 'Upload Guide' },
    { id: 'workflow', label: '+Upload Music' }
  ],
  'music-uploads': [
    { id: 'guide', label: 'Upload Guide' },
    { id: 'workflow', label: '+Upload Music' },
    { id: 'drafts', label: 'Draft Uploads' }
  ],
  'music-catalogue': [
    { id: 'published', label: 'Published Music' },
    { id: 'published-tracks', label: 'All Tracks' },
    { id: 'published-singles', label: 'Singles' },
    { id: 'published-eps', label: 'EPs' },
    { id: 'published-albums', label: 'Albums' },
    { id: 'scheduled', label: 'Scheduled Music' },
    { id: 'scheduled-tracks', label: 'All Tracks' },
    { id: 'scheduled-singles', label: 'Singles' },
    { id: 'scheduled-eps', label: 'EPs' },
    { id: 'scheduled-albums', label: 'Albums' }
  ],
  'music-statistics': [
    { id: 'streams', label: 'All Streams' },
    { id: 'downloads', label: 'All Downloads' },
    { id: 'earnings', label: 'Music Earnings' }
  ],
  'music-manage': [
    { id: 'library', label: 'Music Catalogue' }
  ],
  messages: [
    { id: 'gig_invites', label: 'Gig Invites' },
    { id: 'gig_requests', label: 'Gig Requests' },
    { id: 'colleagues', label: 'Colleague Messages' },
    { id: 'auditions', label: 'Audition / Collab Msgs' },
    { id: 'fans', label: 'Fan Messages' },
    { id: 'artists', label: 'Artist Messages' },
    { id: 'venues', label: 'Venue Messages' },
    { id: 'services', label: 'Service Messages' },
    { id: 'pros', label: 'MusicPro Messages' },
    { id: 'system', label: 'System Messages' }
  ],
  type: [
    { id: 'selector', label: 'Artist Type' }
  ]
}

export function ArtistSidebar({
  activeSection = 'profile',
  activeSubSectionKey = null,
  onSectionChange,
  onSubSectionChange,
  capabilities,
  unreadMessages = 0,
  completedSections = [],
  hideTypeSection,
  className
}: ArtistSidebarProps) {
  const SIDEBAR_STATE_KEY = 'artist-dashboard-sidebar-expanded-v2'
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const defaultExpandedSections = useMemo<Record<string, boolean>>(() => ({
    basics: false,
    media: false,
    crew: false,
    auditions: false,
    banking: false,
    gigManager: false,
    musicManager: false,
    messages: false,
    administration: false
  }), [])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') {
      return defaultExpandedSections
    }
    try {
      const raw = window.localStorage.getItem(SIDEBAR_STATE_KEY)
      if (!raw) return defaultExpandedSections
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return defaultExpandedSections
      return {
        ...defaultExpandedSections,
        ...(parsed as Record<string, boolean>)
      }
    } catch {
      return defaultExpandedSections
    }
  })

  const handleSignOut = async () => {
    const nav = () => router.replace('/login');
    const timeout = setTimeout(nav, 500);
    try {
      await signOut();
    } finally {
      clearTimeout(timeout);
      nav();
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(expandedSections))
    } catch {
      // Ignore storage errors
    }
  }, [expandedSections])

  useEffect(() => {
    const groupBySection: Partial<Record<ArtistDashboardSection, keyof typeof defaultExpandedSections>> = {
      home: 'basics',
      profile: 'basics',
      contract: 'basics',
      royalty: 'basics',
      bio: 'basics',
      genres: 'basics',
      type: 'basics',
      logo: 'media',
      photos: 'media',
      videos: 'media',
      crew: 'crew',
      auditions: 'auditions',
      payments: 'banking',
      'gig-bookings': 'gigManager',
      'gig-reporting': 'gigManager',
      'gig-negotiations': 'gigManager',
      'gig-planner': 'gigManager',
      'gig-statistics': 'gigManager',
      'music-uploads': 'musicManager',
      'music-catalogue': 'musicManager',
      'music-statistics': 'musicManager',
      'music-upload': 'musicManager',
      'music-manage': 'musicManager',
      gigability: 'gigManager',
      'gig-calendar': 'gigManager',
      'gig-create': 'gigManager',
      'gig-upcoming': 'gigManager',
      'gig-past': 'gigManager',
      'gig-invites': 'gigManager',
      'gig-requests': 'gigManager',
      messages: 'messages',
      settings: 'administration',
    }

    const targetGroup = groupBySection[activeSection]
    if (!targetGroup) return
    setExpandedSections((prev) => prev[targetGroup] ? prev : { ...prev, [targetGroup]: true })
  }, [activeSection, defaultExpandedSections])

  const handleSectionChange = (section: string) => {
    if (!isSectionEnabled(section as ArtistDashboardSection, capabilities)) return;
    onSectionChange?.(section as ArtistDashboardSection);
  };

  const handleSubSectionChange = (section: ArtistDashboardSection, subSection: string) => {
    if (!isSectionEnabled(section, capabilities, hideTypeSection)) return
    onSectionChange?.(section)
    onSubSectionChange?.(section, subSection)
  }

  const mainMenuItems: { icon: typeof FileText; label: string; section: ArtistDashboardSection }[] = [
    { icon: FileText, label: "Artist Home", section: "home" }
  ]

  const artistBasicsItems = [
    { icon: User, label: "Artist Basics", section: "profile" as ArtistDashboardSection },
    { icon: Settings, label: "Artist Type", section: "type" as ArtistDashboardSection },
    { icon: Music, label: "Artist Genres", section: "genres" as ArtistDashboardSection },
    { icon: BookOpen, label: "Artist Bio", section: "bio" as ArtistDashboardSection },
    { icon: FileCheck, label: "Contract Status", section: "contract" as ArtistDashboardSection },
    { icon: DollarSign, label: "Default Gig Royalty Splits", section: "royalty" as ArtistDashboardSection },
  ].filter(item => !(hideTypeSection && item.section === 'type'))

  const artistMediaItems = [
    { icon: Palette, label: "Logo & Header", section: "logo" as ArtistDashboardSection },
    { icon: ImageIcon, label: "Photos", section: "photos" as ArtistDashboardSection },
    { icon: Video, label: "Videos", section: "videos" as ArtistDashboardSection }
  ]

  const artistCrewItems = [
    { icon: Users2, label: "Artist Crew", section: "crew" as ArtistDashboardSection }
  ]

  const auditionsItems = [
    { icon: Megaphone, label: "Auditions & Collabs", section: "auditions" as ArtistDashboardSection }
  ]

  const artistBankingItems = [
    { icon: Banknote, label: "Artist Banking", section: "payments" as ArtistDashboardSection }
  ]

  const musicManagerItems = [
    { icon: Music2, label: "Music Uploads", section: "music-upload" as ArtistDashboardSection },
    { icon: Music, label: "Music Catalogue", section: "music-manage" as ArtistDashboardSection }
  ]

  const gigManagerItems = [
    { icon: Clock, label: "Gig-Ability", section: "gigability" as ArtistDashboardSection },
    { icon: CalendarDays, label: "Gig Bookings", section: "gig-bookings" as ArtistDashboardSection },
    { icon: FileCheck, label: "Gig Reporting", section: "gig-reporting" as ArtistDashboardSection },
    { icon: Mail, label: "Gig Negotiations", section: "gig-negotiations" as ArtistDashboardSection },
    { icon: CalendarDays, label: "Gig Planner", section: "gig-planner" as ArtistDashboardSection },
    { icon: BarChart3, label: "Gig Statistics", section: "gig-statistics" as ArtistDashboardSection }
  ]

  const messageItems = [
    { icon: MessageSquare, label: "Messages", section: "messages" as ArtistDashboardSection }
  ]

  const renderSectionItems = (items: { icon: typeof FileText; label: string; section: ArtistDashboardSection }[]) => (
    <div className="space-y-1">
      {items.map((item, index) => {
        const disabled = !isSectionEnabled(item.section as ArtistDashboardSection, capabilities, hideTypeSection)
        const subSections = sectionSubSections[item.section] || []
        const isActive = activeSection === item.section && !disabled
        return (
          <div key={index}>
            <button
              onClick={() => handleSectionChange(item.section)}
              disabled={disabled}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${isActive
                  ? "bg-[#ff8fa31f] text-white shadow-[inset_0_0_0_1px_rgba(255,143,163,0.24)]"
                  : "text-[#b7a8c2] hover:text-white hover:bg-white/5"
                }`}
            >
              <div className="flex items-center space-x-2">
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </div>
              {!disabled && completedSections.includes(item.section) && (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              )}
            </button>
            {!disabled && isActive && subSections.length > 1 && (
              <div className="ml-6 mt-1 space-y-1 border-l border-purple-400/30 pl-3">
                {subSections.map((subSection) => {
                  const subKey = `${item.section}:${subSection.id}`
                  const isSubActive = activeSubSectionKey === subKey
                  return (
                    <button
                      key={subKey}
                      onClick={() => handleSubSectionChange(item.section, subSection.id)}
                      className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${isSubActive
                        ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                        : 'text-[#c7bbd0] hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {subSection.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const renderMainMenuItems = (items: { icon: typeof FileText; label: string; section: ArtistDashboardSection }[]) => (
    <div className="space-y-1">
      {items.map((item, index) => {
        const disabled = !isSectionEnabled(item.section as ArtistDashboardSection, capabilities, hideTypeSection)
        const hasUnreadMessages = item.section === 'messages' && unreadMessages > 0
        const isActive = activeSection === item.section && !disabled
        const itemClass = isActive
          ? "bg-[#ff8fa31f] text-white shadow-[inset_0_0_0_1px_rgba(255,143,163,0.24)]"
          : hasUnreadMessages
            ? "bg-emerald-700/20 text-emerald-200 hover:bg-emerald-700/30"
            : "text-[#b7a8c2] hover:text-white hover:bg-white/5"
        return (
          <button
            key={index}
            onClick={() => handleSectionChange(item.section)}
            disabled={disabled}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              } ${itemClass}`}
          >
            <div className="flex items-center space-x-2">
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {hasUnreadMessages && (
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
              {!disabled && completedSections.includes(item.section) && (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )

  type AdministrationItem =
    | { icon: typeof FileText; label: string; section: ArtistDashboardSection; subSection?: string; path?: never; onClick?: never }
    | { icon: typeof FileText; label: string; path: string; onClick?: () => void; section?: never; subSection?: never }

  const administrationItems: AdministrationItem[] = [
    { icon: Eye, label: "View Profile", path: "/artist-profile" },
    { icon: Edit3, label: "Edit Profile", section: "profile", subSection: "details" },
    { icon: User, label: "Manage Admins", section: "crew", subSection: "manage-team" },
    { icon: CreditCard, label: "Billing & Payments", section: "payments", subSection: "out" },
    { icon: Settings, label: "Settings", section: "settings" },
    { icon: RefreshCw, label: "Switch Profile", path: "/profile-setup" },
    { icon: LogOut, label: "Log Out", path: "/login", onClick: handleSignOut }
  ]

  return (
    <aside className={`h-full w-full max-w-[20rem] bg-[linear-gradient(180deg,_#26122f_0%,_#211028_100%)] p-6 text-left flex flex-col overflow-y-auto lg:w-64 ${className ?? ''}`}>
      <div className="flex items-center mb-8">
        <Image
          src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
          alt="Gigrilla Logo"
          width={160}
          height={48}
          className="h-8 w-auto"
        />
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.32em] text-[#9d8baa]">ARTIST WORKSPACE</h3>
        {!capabilities && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[#f0e9f5]">
            Select your official Artist Type to unlock the rest of the dashboard.
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-[11px] uppercase tracking-[0.32em] text-[#8e7b9d]">Overview</h3>
        {renderMainMenuItems(mainMenuItems)}
      </div>

      <div className="mb-6">
        <button
          onClick={() => toggleSection('basics')}
          className="mb-3 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#8e7b9d] hover:text-white"
        >
          <span>ARTIST PROFILE MENU</span>
          {expandedSections.basics ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.basics && renderSectionItems(artistBasicsItems)}
      </div>

      <div className="mb-6">
        <button
          onClick={() => toggleSection('media')}
          className="mb-3 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#8e7b9d] hover:text-white"
        >
          <span>ARTIST MEDIA</span>
          {expandedSections.media ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.media && renderSectionItems(artistMediaItems)}
      </div>

      <div className="mb-6">
        <button
          onClick={() => toggleSection('crew')}
          className="mb-3 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#8e7b9d] hover:text-white"
        >
          <span>ARTIST CREW</span>
          {expandedSections.crew ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.crew && renderSectionItems(artistCrewItems)}
      </div>

      <div className="mb-6">
        <button
          onClick={() => toggleSection('auditions')}
          className="mb-3 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#8e7b9d] hover:text-white"
        >
          <span>AUDITIONS & COLLABS</span>
          {expandedSections.auditions ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.auditions && renderSectionItems(auditionsItems)}
      </div>

      <div className="mb-6">
        <button
          onClick={() => toggleSection('banking')}
          className="mb-3 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#8e7b9d] hover:text-white"
        >
          <span>ARTIST BANKING</span>
          {expandedSections.banking ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.banking && renderSectionItems(artistBankingItems)}
      </div>

      <div className="mb-6">
        <button
          onClick={() => toggleSection('gigManager')}
          className="mb-3 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#8e7b9d] hover:text-white"
        >
          <span>GIG MENU</span>
          {expandedSections.gigManager ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.gigManager && renderSectionItems(gigManagerItems)}
      </div>

      <div className="mb-6">
        <button
          onClick={() => toggleSection('musicManager')}
          className="mb-3 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#8e7b9d] hover:text-white"
        >
          <span>MUSIC MENU</span>
          {expandedSections.musicManager ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.musicManager && renderSectionItems(musicManagerItems)}
      </div>

      <div className="mb-6 border-t border-white/8 pt-4">
        <button
          onClick={() => toggleSection('messages')}
          className="mb-3 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#8e7b9d] hover:text-white"
        >
          <span>MESSAGE MENU</span>
          {expandedSections.messages ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.messages && renderSectionItems(messageItems)}
      </div>

      <div className="flex-1">
        <button
          onClick={() => toggleSection('administration')}
          className="mb-3 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#8e7b9d] hover:text-white"
        >
          <span>ADMINISTRATION</span>
          {expandedSections.administration ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.administration && (
          <div className="space-y-1">
            {administrationItems.map((item, index) => (
              'section' in item ? (
                (() => {
                  const targetSection = item.section as ArtistDashboardSection
                  return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    handleSectionChange(targetSection)
                    if (item.subSection) {
                      handleSubSectionChange(targetSection, item.subSection)
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    activeSection === targetSection
                      ? "bg-[#ff8fa31f] text-white shadow-[inset_0_0_0_1px_rgba(255,143,163,0.24)]"
                      : "text-[#b7a8c2] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
                  )
                })()
              ) : (
                <Link
                  key={index}
                  href={item.path}
                  onClick={item.onClick}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.path
                      ? "bg-[#ff8fa31f] text-white shadow-[inset_0_0_0_1px_rgba(255,143,163,0.24)]"
                      : "text-[#b7a8c2] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
