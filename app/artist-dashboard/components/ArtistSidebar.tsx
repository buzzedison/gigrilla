"use client";

import { useState, type ComponentType } from "react";
import Image from "next/image";
import {
  User,
  Users,
  Users2,
  BookOpen,
  Music,
  Map,
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
  Clock
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth-context";
import { ArtistTypeCapabilities } from "../../../data/artist-types";

export type ArtistDashboardSection =
  | 'profile'
  | 'crew'
  | 'royalty'
  | 'gigability'
  | 'bio'
  | 'genres'
  | 'maps'
  | 'logo'
  | 'photos'
  | 'videos'
  | 'type'

interface ArtistSidebarProps {
  activeSection?: ArtistDashboardSection
  onSectionChange?: (section: ArtistDashboardSection) => void
  capabilities?: ArtistTypeCapabilities | null
  completedSections?: string[]
  hideTypeSection?: boolean
  className?: string
}

function isSectionEnabled(section: ArtistDashboardSection, capabilities: ArtistTypeCapabilities | null | undefined, hideTypeSection?: boolean) {
  if (hideTypeSection && section === 'type') return false
  if (!capabilities) {
    // Only allow type selection until artist type is saved
    return section === 'type'
  }

  switch (section) {
    case 'maps':
      return capabilities.showGigAbility
    default:
      return true
  }
}

export function ArtistSidebar({ activeSection = 'profile', onSectionChange, capabilities, completedSections = [], hideTypeSection, className }: ArtistSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    activities: true,
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

  const mainMenuItems: { icon: typeof FileText; label: string; section: ArtistDashboardSection }[] = [
    { icon: FileText, label: "Main Dashboard", section: "profile" }
  ]

  const activitiesItems = [
    { icon: User, label: "Basic Artist Details", section: "profile" as ArtistDashboardSection },
    { icon: Users2, label: "Artist Crew", section: "crew" as ArtistDashboardSection },
    { icon: DollarSign, label: "Default Royalty Splits", section: "royalty" as ArtistDashboardSection },
    { icon: Clock, label: "Artist Gig-Ability", section: "gigability" as ArtistDashboardSection },
    { icon: BookOpen, label: "Artist Biography", section: "bio" as ArtistDashboardSection },
    { icon: Music, label: "Artist Genres", section: "genres" as ArtistDashboardSection },
    { icon: Map, label: "GigAbility Maps", section: "maps" as ArtistDashboardSection },
    { icon: Palette, label: "Logo/Profile Artwork", section: "logo" as ArtistDashboardSection },
    { icon: ImageIcon, label: "Photos", section: "photos" as ArtistDashboardSection },
    { icon: Video, label: "Videos", section: "videos" as ArtistDashboardSection },
    { icon: Settings, label: "Artist Type & Config", section: "type" as ArtistDashboardSection }
  ].filter(item => !(hideTypeSection && item.section === 'type'))

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
    <aside className={`w-64 bg-[#2a1b3d] h-full flex flex-col p-6 overflow-y-auto ${className ?? ''}`}>
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
        <div className="space-y-1">
          {mainMenuItems.map((item, index) => {
            const disabled = !isSectionEnabled(item.section as ArtistDashboardSection, capabilities, hideTypeSection)
            return (
              <button
                key={index}
                onClick={() => handleSectionChange(item.section)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                  disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  activeSection === item.section && !disabled
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
      </div>

      <div className="mb-6">
        <button
          onClick={() => toggleSection('activities')}
          className="w-full flex items-center justify-between text-gray-400 text-sm uppercase tracking-wider mb-3 hover:text-white"
        >
          <span>ACTIVITIES</span>
          {expandedSections.activities ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        {expandedSections.activities && (
          <div className="space-y-1">
            {activitiesItems.map((item, index) => {
              const disabled = !isSectionEnabled(item.section as ArtistDashboardSection, capabilities, hideTypeSection)
              return (
              <button
                key={index}
                onClick={() => handleSectionChange(item.section)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                  disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  activeSection === item.section && !disabled
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
        )}
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
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.path
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
