"use client";

import { useState } from "react";
import Image from "next/image";
import {
  User,
  Users2,
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
  Edit
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth-context";
import { ArtistTypeCapabilities } from "../../../data/artist-types";

export type ArtistDashboardSection =
  | 'profile'
  | 'payments'
  | 'crew'
  | 'auditions'
  | 'royalty'
  | 'gigability'
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
  | 'music-upload'
  | 'music-manage'
  | 'type'
  | 'contract'

interface ArtistSidebarProps {
  activeSection?: ArtistDashboardSection
  activeSubSectionKey?: string | null
  onSectionChange?: (section: ArtistDashboardSection) => void
  onSubSectionChange?: (section: ArtistDashboardSection, subSection: string) => void
  capabilities?: ArtistTypeCapabilities | null
  completedSections?: string[]
  hideTypeSection?: boolean
  className?: string
}

function isSectionEnabled(section: ArtistDashboardSection, capabilities: ArtistTypeCapabilities | null | undefined, hideTypeSection?: boolean) {
  if (hideTypeSection && section === 'type') return false

  // Always allow type section (users can change their artist type anytime)
  if (section === 'type') return true

  if (!capabilities) {
    // Only 'type' section is enabled until artist type is saved
    // All other sections are disabled
    return false
  }

  switch (section) {
    case 'gigability':
    case 'gig-calendar':
    case 'gig-create':
    case 'gig-upcoming':
    case 'gig-past':
    case 'gig-invites':
    case 'gig-requests':
      return capabilities.showGigAbility
    default:
      return true
  }
}

type SidebarSubSection = {
  id: string
  label: string
}

const sectionSubSections: Partial<Record<ArtistDashboardSection, SidebarSubSection[]>> = {
  profile: [
    { id: 'details', label: 'Artist Details' },
    { id: 'social', label: 'Social Accounts' }
  ],
  payments: [
    { id: 'preference', label: 'Banking Preference' },
    { id: 'out', label: 'Payments Out' },
    { id: 'in', label: 'Payments In' }
  ],
  crew: [
    { id: 'owner', label: 'Your Roles & Info' },
    { id: 'add-members', label: 'Add Members' },
    { id: 'manage-team', label: 'Manage Team' }
  ],
  auditions: [
    { id: 'add', label: 'Add Advert' },
    { id: 'manage', label: 'Manage Adverts' }
  ],
  contract: [
    { id: 'label', label: 'Record Label' },
    { id: 'publisher', label: 'Music Publisher' },
    { id: 'manager', label: 'Artist Manager' },
    { id: 'booking', label: 'Booking Agent' }
  ],
  royalty: [
    { id: 'overview', label: 'Overview' },
    { id: 'splits', label: 'Team Splits' },
    { id: 'save', label: 'Save' }
  ],
  gigability: [
    { id: 'base', label: 'Base Location' },
    { id: 'sets', label: 'Set Lengths' },
    { id: 'local', label: 'Local Area' },
    { id: 'wider', label: 'Wider Area' }
  ],
  'gig-calendar': [
    { id: 'add', label: 'ADD/CREATE GIG' },
    { id: 'upcoming', label: 'AMEND UPCOMING GIGS' },
    { id: 'past', label: 'Past & Unscheduled' }
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
    { id: 'editor', label: 'Bio Editor' }
  ],
  genres: [
    { id: 'selector', label: 'Genre Selector' }
  ],
  logo: [
    { id: 'logo', label: 'Logo Upload' },
    { id: 'header', label: 'Header Image' }
  ],
  photos: [
    { id: 'gallery', label: 'Photo Gallery' }
  ],
  videos: [
    { id: 'upload', label: 'Add Videos' },
    { id: 'manage', label: 'Manage Videos' }
  ],
  'music-upload': [
    { id: 'intro', label: 'Upload Intro' },
    { id: 'workflow', label: 'Release Workflow' }
  ],
  'music-manage': [
    { id: 'library', label: 'Library' }
  ],
  type: [
    { id: 'selector', label: 'Type Selector' }
  ]
}

export function ArtistSidebar({
  activeSection = 'profile',
  activeSubSectionKey = null,
  onSectionChange,
  onSubSectionChange,
  capabilities,
  completedSections = [],
  hideTypeSection,
  className
}: ArtistSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    profile: true,
    musicManager: true,
    gigManager: true,
    artworkMedia: true,
    administration: true
  });

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
    { icon: FileText, label: "Main Dashboard", section: "profile" }
  ]

  const profileItems = [
    { icon: User, label: "Basic Artist Details", section: "profile" as ArtistDashboardSection },
    { icon: Banknote, label: "Artist Payments", section: "payments" as ArtistDashboardSection },
    { icon: Users2, label: "Artist Crew", section: "crew" as ArtistDashboardSection },
    { icon: Megaphone, label: "Auditions & Collabs", section: "auditions" as ArtistDashboardSection },
    { icon: FileCheck, label: "Contract Status", section: "contract" as ArtistDashboardSection },
    { icon: DollarSign, label: "Default Gig Royalty Splits", section: "royalty" as ArtistDashboardSection },
    { icon: BookOpen, label: "Artist Biography", section: "bio" as ArtistDashboardSection },
    { icon: Music, label: "Artist Genres", section: "genres" as ArtistDashboardSection },
    { icon: Settings, label: "Artist Type & Config", section: "type" as ArtistDashboardSection }
  ].filter(item => !(hideTypeSection && item.section === 'type'))

  const musicManagerItems = [
    { icon: Music2, label: "Upload Music", section: "music-upload" as ArtistDashboardSection },
    { icon: Music, label: "Manage Music", section: "music-manage" as ArtistDashboardSection }
  ]

  const gigManagerItems = [
    { icon: Clock, label: "Gig-Ability", section: "gigability" as ArtistDashboardSection },
    { icon: Plus, label: "Add / Create Gig", section: "gig-create" as ArtistDashboardSection },
    { icon: Edit, label: "Amend Upcoming Gigs", section: "gig-upcoming" as ArtistDashboardSection },
    { icon: CalendarDays, label: "Past & Unscheduled", section: "gig-past" as ArtistDashboardSection },
    { icon: Mail, label: "Gig Invites", section: "gig-invites" as ArtistDashboardSection },
    { icon: Inbox, label: "Gig Requests", section: "gig-requests" as ArtistDashboardSection }
  ]

  const artworkMediaItems = [
    { icon: Palette, label: "Logo/Profile Artwork", section: "logo" as ArtistDashboardSection },
    { icon: ImageIcon, label: "Photos", section: "photos" as ArtistDashboardSection },
    { icon: Video, label: "Videos", section: "videos" as ArtistDashboardSection }
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
                  ? "bg-purple-600/20 text-white"
                  : "text-gray-400 hover:text-white hover:bg-purple-600/10"
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
            {!disabled && isActive && subSections.length > 0 && (
              <div className="ml-6 mt-1 space-y-1 border-l border-purple-400/30 pl-3">
                {subSections.map((subSection) => {
                  const subKey = `${item.section}:${subSection.id}`
                  const isSubActive = activeSubSectionKey === subKey
                  return (
                    <button
                      key={subKey}
                      onClick={() => handleSubSectionChange(item.section, subSection.id)}
                      className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${isSubActive
                        ? 'bg-purple-500/20 text-white'
                        : 'text-purple-200 hover:text-white hover:bg-purple-600/10'
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
        return (
          <button
            key={index}
            onClick={() => handleSectionChange(item.section)}
            disabled={disabled}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              } ${activeSection === item.section && !disabled
                ? "bg-purple-600/20 text-white"
                : "text-gray-400 hover:text-white hover:bg-purple-600/10"
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
        )
      })}
    </div>
  )

  const administrationItems = [
    { icon: Eye, label: "View Profile", path: "/artist-dashboard?section=view" },
    { icon: Edit3, label: "Edit Profile", path: "/artist-dashboard?section=edit" },
    { icon: User, label: "Manage Admins", path: "/artist-dashboard?section=admins" },
    { icon: CreditCard, label: "Billing & Payments", path: "/artist-dashboard?section=billing" },
    { icon: Settings, label: "Settings", path: "/artist-dashboard?section=settings" },
    { icon: RefreshCw, label: "Switch Profile", path: "/profile-setup" },
    { icon: LogOut, label: "Log Out", path: "/login", onClick: handleSignOut }
  ];

  return (
    <aside className={`w-64 bg-[#2a1b3d] h-full flex flex-col p-6 overflow-y-auto text-left ${className ?? ''}`}>
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
        <h3 className="text-purple-300 text-sm uppercase tracking-wider mb-3 font-medium">EDIT PROFILE</h3>
        {!capabilities && (
          <div className="bg-purple-900/40 border border-purple-400/40 rounded-lg p-3 text-xs text-purple-100">
            Select your official Artist Type to unlock the rest of the dashboard.
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Main Menu</h3>
        {renderMainMenuItems(mainMenuItems)}
      </div>

      <div className="mb-6">
        <button
          onClick={() => toggleSection('profile')}
          className="w-full flex items-center justify-between text-gray-400 text-sm uppercase tracking-wider mb-3 hover:text-white"
        >
          <span>PROFILE</span>
          {expandedSections.profile ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.profile && renderSectionItems(profileItems)}
      </div>

      <div className="mb-6">
        <button
          onClick={() => toggleSection('musicManager')}
          className="w-full flex items-center justify-between text-gray-400 text-sm uppercase tracking-wider mb-3 hover:text-white"
        >
          <span>MUSIC MANAGER</span>
          {expandedSections.musicManager ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.musicManager && renderSectionItems(musicManagerItems)}
      </div>

      <div className="mb-6 pt-4 border-t border-purple-900/50">
        <button
          onClick={() => toggleSection('gigManager')}
          className="w-full flex items-center justify-between text-gray-400 text-sm uppercase tracking-wider mb-3 hover:text-white"
        >
          <span>GIG MANAGER</span>
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
          onClick={() => toggleSection('artworkMedia')}
          className="w-full flex items-center gap-2 text-gray-400 text-sm uppercase tracking-wider mb-3 hover:text-white"
        >
          <span className="flex-1 text-left">ARTIST ARTWORK & MEDIA</span>
          {expandedSections.artworkMedia ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.artworkMedia && renderSectionItems(artworkMediaItems)}
      </div>

      <div className="flex-1">
        <button
          onClick={() => toggleSection('administration')}
          className="w-full flex items-center justify-between text-gray-400 text-sm uppercase tracking-wider mb-3 hover:text-white"
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
              item.label === 'Log Out' ? (
                <Link
                  key={index}
                  href={item.path}
                  onClick={item.onClick}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-purple-600/10"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ) : (
                <Link
                  key={index}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === item.path
                    ? "bg-purple-600/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-purple-600/10"
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
