"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
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
  Plus,
  MessageSquare,
  LayoutDashboard,
  SunMoon,
  Globe,
  MonitorUp,
  MapPinned,
  Building2,
  Wallet,
  BookMarked,
  Radio,
  Inbox,
  UserRoundCog,
  Landmark,
  Guitar,
  BadgeCheck,
  CalendarRange,
  AudioWaveform,
  Disc3,
  CircleDollarSign,
  Gauge,
  FolderKanban,
  ListChecks,
  Users,
  Bell,
  ShoppingBag,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "../../../lib/auth-context"
import { ArtistTypeCapabilities } from "../../../data/artist-types"

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
  isCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  capabilities?: ArtistTypeCapabilities | null
  unreadMessages?: number
  completedSections?: string[]
  hideTypeSection?: boolean
  className?: string
}

function isSectionEnabled(section: ArtistDashboardSection, capabilities: ArtistTypeCapabilities | null | undefined, hideTypeSection?: boolean) {
  if (hideTypeSection && section === 'type') return false

  if (section === 'type') return true

  if (!capabilities) {
    return section === 'home' || section === 'profile' || section === 'messages' || section === 'settings'
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

type SidebarChild = {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  section?: ArtistDashboardSection
  subSection?: string
  path?: string
  action?: 'toggleAll' | 'profileView' | 'theme' | 'logout'
  badge?: string | number | null
}

type SidebarNode = SidebarChild & {
  children?: SidebarChild[]
}

type SidebarGroup = {
  id: string
  label: string
  items: SidebarNode[]
}

const GROUP_IDS = ['controlPanel', 'artistProfile', 'gigMenu', 'musicMenu', 'merchMenu', 'messageMenu'] as const
const ITEM_IDS = [
  'artist-basics',
  'artist-crew',
  'artist-money-splits',
  'artist-banking',
  'artist-media',
  'auditions-collabs',
  'gig-ability',
  'gig-bookings',
  'gig-reporting',
  'gig-negotiations',
  'gig-planner',
  'gig-statistics',
  'music-uploads',
  'music-catalogue',
  'music-statistics',
  'message-negotiations',
  'user-messages',
] as const

function buildDefaultGroupState(isDesktop: boolean) {
  return {
    controlPanel: isDesktop,
    artistProfile: isDesktop,
    gigMenu: false,
    musicMenu: false,
    merchMenu: false,
    messageMenu: false,
  }
}

function buildDefaultItemState() {
  return ITEM_IDS.reduce<Record<string, boolean>>((acc, id) => {
    acc[id] = false
    return acc
  }, {})
}

export function ArtistSidebar({
  activeSection = 'profile',
  activeSubSectionKey = null,
  onSectionChange,
  onSubSectionChange,
  isCollapsed = false,
  onCollapsedChange,
  capabilities,
  unreadMessages = 0,
  completedSections = [],
  hideTypeSection,
  className
}: ArtistSidebarProps) {
  const GROUP_STATE_KEY = 'artist-dashboard-sidebar-groups-v3'
  const ITEM_STATE_KEY = 'artist-dashboard-sidebar-items-v3'
  const COLOR_MODE_KEY = 'gigrilla-dashboard-colour-mode'
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useAuth()

  const getIsDesktop = () => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true)

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const defaults = buildDefaultGroupState(getIsDesktop())
    if (typeof window === 'undefined') return defaults
    try {
      const raw = window.localStorage.getItem(GROUP_STATE_KEY)
      if (!raw) return defaults
      return { ...defaults, ...(JSON.parse(raw) as Record<string, boolean>) }
    } catch {
      return defaults
    }
  })
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
    const defaults = buildDefaultItemState()
    if (typeof window === 'undefined') return defaults
    try {
      const raw = window.localStorage.getItem(ITEM_STATE_KEY)
      if (!raw) return defaults
      return { ...defaults, ...(JSON.parse(raw) as Record<string, boolean>) }
    } catch {
      return defaults
    }
  })
  const [colourMode, setColourMode] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const saved = window.localStorage.getItem(COLOR_MODE_KEY)
    return saved === 'light' ? 'light' : 'dark'
  })

  const handleSignOut = async () => {
    const nav = () => router.replace('/login')
    const timeout = setTimeout(nav, 500)
    try {
      await signOut()
    } finally {
      clearTimeout(timeout)
      nav()
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(GROUP_STATE_KEY, JSON.stringify(expandedGroups))
  }, [expandedGroups])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(ITEM_STATE_KEY, JSON.stringify(expandedItems))
  }, [expandedItems])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.gigrillaColourMode = colourMode
    window.localStorage.setItem(COLOR_MODE_KEY, colourMode)
  }, [colourMode])

  const activeSubSection = activeSubSectionKey?.split(':')[1] || null

  const groups = useMemo<SidebarGroup[]>(() => {
    const messageBadge = unreadMessages > 0 ? (unreadMessages > 99 ? '99+' : unreadMessages) : null

    const controlPanelItems: SidebarNode[] = [
      { id: 'artist-home', label: 'Artist HOME', icon: Music, section: 'home' },
      { id: 'expand-hide', label: 'Expand<>Hide Menus', icon: LayoutDashboard, action: 'toggleAll' },
      { id: 'profile-view', label: 'Ctrl Panel/Profile View', icon: Globe, action: 'profileView', path: '/artist-profile' },
      { id: 'theme-mode', label: colourMode === 'dark' ? 'Light Mode' : 'Dark Mode', icon: SunMoon, action: 'theme' },
      { id: 'switch-profile', label: 'Switch/Add Profile', icon: RefreshCw, path: '/profile-setup' },
      { id: 'account-settings', label: 'Account Settings', icon: Settings, section: 'settings' },
      { id: 'billing-payments', label: 'Billing & Payments', icon: CreditCard, section: 'payments', subSection: 'out' },
      { id: 'logout', label: 'Log Out of Gigrilla', icon: LogOut, action: 'logout', path: '/login' },
    ]

    const artistProfileItems: SidebarNode[] = [
      {
        id: 'artist-basics',
        label: 'Artist Basics',
        icon: UserRoundCog,
        section: 'profile',
        subSection: 'details',
        children: [
          { id: 'artist-type', label: 'Artist Type', section: 'type', subSection: 'selector' },
          { id: 'artist-stage-name', label: 'Artist Stage Name', section: 'profile', subSection: 'artist-stage-name' },
          { id: 'artist-entity-isni', label: 'Artist Entity ISNI', section: 'profile', subSection: 'artist-entity-isni' },
          { id: 'artist-formed', label: 'Artist Formed', section: 'profile', subSection: 'artist-formed' },
          { id: 'artist-performers-count', label: 'Number of Performers', section: 'profile', subSection: 'artist-performers-count' },
          { id: 'artist-hometown', label: 'Artist Hometown', section: 'profile', subSection: 'artist-hometown' },
          { id: 'artist-contract-status', label: 'Artist Contract Status', section: 'contract', subSection: 'label' },
          { id: 'artist-genres', label: 'Artist Genres', section: 'genres', subSection: 'selector' },
          { id: 'artist-bio', label: 'Artist Bio', section: 'bio', subSection: 'editor' },
          { id: 'artist-gig-counter', label: 'Public Gigs Performed Without Gigrilla (Adds to System Gig Count)', section: 'profile', subSection: 'artist-gig-counter' },
          { id: 'artist-web-links', label: 'Artist Web Links', section: 'profile', subSection: 'artist-web-links' },
        ]
      },
      {
        id: 'artist-crew',
        label: 'Artist Crew',
        icon: Users2,
        section: 'crew',
        subSection: 'owner',
        children: [
          { id: 'your-roles-info', label: 'Your Roles & Info', section: 'crew', subSection: 'owner' },
          { id: 'add-performer', label: '+Add Performer Role', section: 'crew', subSection: 'add-members' },
          { id: 'add-support-crew', label: '+Add Support Crew Role', section: 'crew', subSection: 'add-members' },
          { id: 'view-performers', label: 'View Performers', section: 'crew', subSection: 'view-performers' },
          { id: 'view-support-crew', label: 'View Support Crew', section: 'crew', subSection: 'view-support-crew' },
          { id: 'manage-admins', label: 'Manage Admins', section: 'crew', subSection: 'manage-admins' },
          { id: 'historic-members', label: 'Historic Members', section: 'crew', subSection: 'historic-members' },
        ]
      },
      {
        id: 'artist-money-splits',
        label: 'Money Splits',
        icon: CircleDollarSign,
        section: 'royalty',
        subSection: 'splits',
        children: [
          { id: 'artist-gig-money-splits', label: 'Gig Money Splits', section: 'royalty', subSection: 'splits' },
          { id: 'artist-merch-money-splits', label: 'Merch Money Splits', section: 'royalty', subSection: 'merch-splits' },
        ]
      },
      {
        id: 'artist-banking',
        label: 'Artist Banking',
        icon: Landmark,
        section: 'payments',
        subSection: 'legal-entity',
        children: [
          { id: 'artist-legal-entity', label: 'Artist Legal Entity', section: 'payments', subSection: 'legal-entity' },
          { id: 'artist-legal-members', label: 'Artist Legal Members', section: 'payments', subSection: 'legal-members' },
          { id: 'artist-money-in', label: 'Money In', section: 'payments', subSection: 'in' },
          { id: 'artist-money-out', label: 'Money Out', section: 'payments', subSection: 'out' },
        ]
      },
      {
        id: 'artist-media',
        label: 'Artist Media',
        icon: ImageIcon,
        section: 'logo',
        subSection: 'logo',
        children: [
          { id: 'artist-logo', label: 'Logo', section: 'logo', subSection: 'logo' },
          { id: 'artist-header', label: 'Header', section: 'logo', subSection: 'header' },
          { id: 'artist-photos', label: 'Photos', section: 'photos', subSection: 'gallery' },
          { id: 'artist-videos', label: 'Videos', section: 'videos', subSection: 'upload' },
        ]
      },
      {
        id: 'auditions-collabs',
        label: 'Auditions & Collabs',
        icon: Megaphone,
        section: 'auditions',
        subSection: 'add',
        children: [
          { id: 'create-ad', label: '+Create an Ad', section: 'auditions', subSection: 'add' },
          { id: 'draft-ads', label: 'Draft Ads', section: 'auditions', subSection: 'manage' },
          { id: 'published-ads', label: 'Published Ads', section: 'auditions', subSection: 'manage' },
          { id: 'unpublished-ads', label: 'Unpublished Ads', section: 'auditions', subSection: 'manage' },
          { id: 'historic-ads', label: 'Historic Ads', section: 'auditions', subSection: 'manage' },
          { id: 'my-advert-messages', label: 'My Advert Messages', section: 'messages', subSection: 'auditions', badge: 3 },
        ]
      },
    ]

    const gigItems: SidebarNode[] = [
      {
        id: 'gig-ability',
        label: 'Gig-Ability',
        icon: Gauge,
        section: 'gigability',
        subSection: 'base',
        children: [
          { id: 'gig-splits', label: 'Gig Money Splits', section: 'royalty', subSection: 'splits' },
          { id: 'gig-base-location', label: 'Base Location', section: 'gigability', subSection: 'base' },
          { id: 'gig-set-lengths', label: 'Set Lengths', section: 'gigability', subSection: 'sets' },
          { id: 'gig-fees', label: 'Gig Fees', section: 'gigability', subSection: 'fees' },
          { id: 'gig-local-area', label: 'Local Gig Area', section: 'gigability', subSection: 'local' },
          { id: 'gig-wider-area', label: 'Wider Gig Area', section: 'gigability', subSection: 'wider' },
        ]
      },
      {
        id: 'gig-bookings',
        label: 'Gig Bookings',
        icon: CalendarDays,
        section: 'gig-bookings',
        subSection: 'book-new',
        children: [
          { id: 'book-new-gig', label: '+Book a New Gig', section: 'gig-bookings', subSection: 'book-new' },
          { id: 'add-gig-manually', label: '+Add Gig Manually', section: 'gig-bookings', subSection: 'add-manually' },
          { id: 'draft-gigs', label: 'Draft Gigs', section: 'gig-bookings', subSection: 'drafts' },
          { id: 'upcoming-gigs', label: 'Upcoming Gigs', section: 'gig-bookings', subSection: 'upcoming' },
          { id: 'scheduled-hidden-gigs', label: 'Scheduled/Hidden', section: 'gig-bookings', subSection: 'scheduled-hidden' },
          { id: 'historic-gigs', label: 'Historic Gigs', section: 'gig-bookings', subSection: 'historic' },
        ]
      },
      {
        id: 'gig-reporting',
        label: 'Gig Reporting',
        icon: ListChecks,
        section: 'gig-reporting',
        subSection: 'confirm-gig',
        children: [
          { id: 'confirm-a-gig', label: 'Confirm a Gig', section: 'gig-reporting', subSection: 'confirm-gig' },
          { id: 'report-a-gig', label: 'Report a Gig', section: 'gig-reporting', subSection: 'report-venue' },
        ]
      },
      {
        id: 'gig-negotiations',
        label: 'Gig Negotiations',
        icon: Mail,
        section: 'gig-negotiations',
        subSection: 'gig_invites',
        children: [
          { id: 'gig-invites', label: 'Gig Invites', section: 'gig-negotiations', subSection: 'gig_invites', badge: 16 },
          { id: 'gig-requests', label: 'Gig Requests', section: 'gig-negotiations', subSection: 'gig_requests', badge: 12 },
          { id: 'gig-confirmations', label: 'Confirmations', section: 'gig-negotiations', subSection: 'confirmations', badge: 3 },
        ]
      },
      {
        id: 'gig-planner',
        label: 'Gig Planner',
        icon: CalendarRange,
        section: 'gig-planner',
        subSection: 'calendar',
        children: [
          { id: 'view-calendar', label: 'View Calendar', section: 'gig-planner', subSection: 'calendar' },
          { id: 'unavailability', label: '+Unavailability', section: 'gig-planner', subSection: 'unavailability' },
        ]
      },
      {
        id: 'gig-statistics',
        label: 'Gig Statistics',
        icon: BarChart3,
        section: 'gig-statistics',
        subSection: 'performed',
        children: [
          { id: 'gigs-performed', label: 'Gigs Performed', section: 'gig-statistics', subSection: 'performed' },
          { id: 'gig-locations', label: 'Gig Locations', section: 'gig-statistics', subSection: 'locations' },
          { id: 'gig-venues', label: 'Gig Venues', section: 'gig-statistics', subSection: 'venues' },
          { id: 'gig-earnings', label: 'Gig Earnings', section: 'gig-statistics', subSection: 'earnings' },
        ]
      },
    ]

    const musicItems: SidebarNode[] = [
      {
        id: 'music-uploads',
        label: 'Music Uploads',
        icon: AudioWaveform,
        section: 'music-uploads',
        subSection: 'guide',
        children: [
          { id: 'upload-guide', label: 'Upload Guide', section: 'music-uploads', subSection: 'guide' },
          { id: 'upload-music', label: '+Upload Music', section: 'music-upload', subSection: 'workflow' },
          { id: 'draft-uploads', label: 'Draft Uploads', section: 'music-uploads', subSection: 'drafts' },
        ]
      },
      {
        id: 'music-catalogue',
        label: 'Music Catalogue',
        icon: Disc3,
        section: 'music-catalogue',
        subSection: 'published',
        children: [
          { id: 'published-music', label: 'Published Music', section: 'music-catalogue', subSection: 'published' },
          { id: 'published-all-tracks', label: 'All Tracks', section: 'music-catalogue', subSection: 'published-tracks' },
          { id: 'published-singles', label: 'Singles', section: 'music-catalogue', subSection: 'published-singles' },
          { id: 'published-eps', label: 'EPs', section: 'music-catalogue', subSection: 'published-eps' },
          { id: 'published-albums', label: 'Albums', section: 'music-catalogue', subSection: 'published-albums' },
          { id: 'scheduled-music', label: 'Scheduled Music', section: 'music-catalogue', subSection: 'scheduled' },
          { id: 'scheduled-all-tracks', label: 'All Tracks', section: 'music-catalogue', subSection: 'scheduled-tracks' },
          { id: 'scheduled-singles', label: 'Singles', section: 'music-catalogue', subSection: 'scheduled-singles' },
          { id: 'scheduled-eps', label: 'EPs', section: 'music-catalogue', subSection: 'scheduled-eps' },
          { id: 'scheduled-albums', label: 'Albums', section: 'music-catalogue', subSection: 'scheduled-albums' },
        ]
      },
      {
        id: 'music-statistics',
        label: 'Music Statistics',
        icon: FolderKanban,
        section: 'music-statistics',
        subSection: 'streams',
        children: [
          { id: 'music-all-streams', label: 'All Streams', section: 'music-statistics', subSection: 'streams' },
          { id: 'music-all-downloads', label: 'All Downloads', section: 'music-statistics', subSection: 'downloads' },
          { id: 'music-earnings', label: 'Music Earnings', section: 'music-statistics', subSection: 'earnings' },
        ]
      },
    ]

    const merchItems: SidebarNode[] = [
      {
        id: 'merch-money-splits',
        label: 'Merch Money Splits',
        icon: ShoppingBag,
        section: 'royalty',
        subSection: 'merch-splits',
      },
    ]

    const messageItems: SidebarNode[] = [
      {
        id: 'message-negotiations',
        label: 'Gig Negotiations',
        icon: Mail,
        section: 'messages',
        subSection: 'gig_invites',
        children: [
          { id: 'messages-gig-invites', label: 'Gig Invites', section: 'messages', subSection: 'gig_invites', badge: 16 },
          { id: 'messages-gig-requests', label: 'Gig Requests', section: 'messages', subSection: 'gig_requests', badge: 12 },
          { id: 'messages-confirmations', label: 'Confirmations', section: 'gig-negotiations', subSection: 'confirmations', badge: 3 },
        ]
      },
      {
        id: 'user-messages',
        label: 'User Messages',
        icon: Users,
        section: 'messages',
        subSection: 'colleagues',
        children: [
          { id: 'colleague-messages', label: 'Colleague Messages', section: 'messages', subSection: 'colleagues', badge: 3 },
          { id: 'advert-messages', label: 'My Advert Messages', section: 'messages', subSection: 'auditions', badge: 3 },
          { id: 'fan-messages', label: 'Fan Messages', section: 'messages', subSection: 'fans', badge: 16 },
          { id: 'artist-messages', label: 'Artist Messages', section: 'messages', subSection: 'artists', badge: 3 },
          { id: 'venue-messages', label: 'Venue Messages', section: 'messages', subSection: 'venues', badge: 12 },
          { id: 'service-messages', label: 'Service Messages', section: 'messages', subSection: 'services', badge: 3 },
          { id: 'musicpro-messages', label: 'MusicPro Messages', section: 'messages', subSection: 'pros', badge: 3 },
        ]
      },
      {
        id: 'system-messages',
        label: 'System Messages',
        icon: Bell,
        section: 'messages',
        subSection: 'system',
        badge: messageBadge,
      },
    ]

    return [
      { id: 'controlPanel', label: 'Control Panel Menu', items: controlPanelItems },
      { id: 'artistProfile', label: 'Artist Profile Menu', items: artistProfileItems },
      { id: 'gigMenu', label: 'Gig Menu', items: gigItems },
      { id: 'musicMenu', label: 'Music Menu', items: musicItems },
      { id: 'merchMenu', label: 'Merch Menu', items: merchItems },
      { id: 'messageMenu', label: 'Messages Menu', items: messageItems },
    ]
  }, [colourMode, unreadMessages])

  const isChildActive = (child: SidebarChild) => {
    if (child.path) return pathname === child.path
    if (child.section && child.subSection) return activeSection === child.section && activeSubSection === child.subSection
    if (child.section) return activeSection === child.section
    return false
  }

  const isNodeActive = (node: SidebarNode) => {
    if (isChildActive(node)) return true
    return node.children?.some(isChildActive) || false
  }

  useEffect(() => {
    const sectionGroupMap: Partial<Record<ArtistDashboardSection, string>> = {
      home: 'controlPanel',
      settings: 'controlPanel',
      profile: 'artistProfile',
      type: 'artistProfile',
      contract: 'artistProfile',
      genres: 'artistProfile',
      bio: 'artistProfile',
      crew: 'artistProfile',
      royalty: 'artistProfile',
      payments: 'artistProfile',
      logo: 'artistProfile',
      photos: 'artistProfile',
      videos: 'artistProfile',
      auditions: 'artistProfile',
      gigability: 'gigMenu',
      'gig-bookings': 'gigMenu',
      'gig-reporting': 'gigMenu',
      'gig-negotiations': 'gigMenu',
      'gig-planner': 'gigMenu',
      'gig-statistics': 'gigMenu',
      'gig-calendar': 'gigMenu',
      'gig-create': 'gigMenu',
      'gig-upcoming': 'gigMenu',
      'gig-past': 'gigMenu',
      'gig-invites': 'gigMenu',
      'gig-requests': 'gigMenu',
      'music-uploads': 'musicMenu',
      'music-catalogue': 'musicMenu',
      'music-statistics': 'musicMenu',
      'music-upload': 'musicMenu',
      'music-manage': 'musicMenu',
      messages: 'messageMenu',
    }

    const targetGroup = activeSection === 'royalty' && activeSubSection === 'merch-splits'
      ? 'merchMenu'
      : sectionGroupMap[activeSection]
    if (targetGroup) {
      setExpandedGroups((prev) => (prev[targetGroup] ? prev : { ...prev, [targetGroup]: true }))
    }

    const matchedNode = groups.flatMap((group) => group.items).find((node) => isNodeActive(node))
    if (matchedNode?.children?.length) {
      setExpandedItems((prev) => (prev[matchedNode.id] ? prev : { ...prev, [matchedNode.id]: true }))
    }
  }, [activeSection, activeSubSection, groups, pathname])

  const navigateEntry = (entry: SidebarChild) => {
    if (entry.action === 'logout') {
      handleSignOut()
      return
    }
    if (entry.action === 'theme') {
      setColourMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
      return
    }
    if (entry.action === 'toggleAll') {
      const shouldOpenEverything = Object.values(expandedGroups).some((value) => !value) || Object.values(expandedItems).some((value) => !value)
      setExpandedGroups(Object.fromEntries(GROUP_IDS.map((id) => [id, shouldOpenEverything])))
      setExpandedItems(Object.fromEntries(ITEM_IDS.map((id) => [id, shouldOpenEverything])))
      return
    }
    if (entry.action === 'profileView') {
      router.push(pathname === '/artist-profile' ? '/artist-dashboard?section=home' : '/artist-profile')
      return
    }
    if (entry.path) {
      router.push(entry.path)
      return
    }
    if (entry.section) {
      if (!isSectionEnabled(entry.section, capabilities, hideTypeSection)) return
      onSectionChange?.(entry.section)
      if (entry.subSection) onSubSectionChange?.(entry.section, entry.subSection)
    }
  }

  const renderBadge = (badge?: string | number | null) => {
    if (badge === null || badge === undefined || badge === 0) return null
    return (
      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/85">
        {badge}
      </span>
    )
  }

  const renderLeafButton = (entry: SidebarChild, indent = false) => {
    const active = isChildActive(entry)
    const disabled = entry.section ? !isSectionEnabled(entry.section, capabilities, hideTypeSection) : false
    const baseClass = active
      ? 'bg-[#ff8fa31f] text-white shadow-[inset_0_0_0_1px_rgba(255,143,163,0.24)]'
      : 'text-[#b7a8c2] hover:text-white hover:bg-white/5'

    if (isCollapsed) {
      const Icon = entry.icon
      return (
        <button
          key={entry.id}
          type="button"
          onClick={() => navigateEntry(entry)}
          disabled={disabled}
          title={entry.label}
          aria-label={entry.label}
          className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'} ${baseClass}`}
        >
          {Icon ? <Icon className="h-5 w-5" /> : <span className="text-xs font-bold">{entry.label.charAt(0)}</span>}
          {entry.badge ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ff8fa3]" /> : null}
          {!disabled && entry.section && completedSections.includes(entry.section) && !indent ? (
            <CheckCircle2 className="absolute bottom-1 right-1 h-3 w-3 text-green-400" />
          ) : null}
        </button>
      )
    }

    return (
      <button
        key={entry.id}
        type="button"
        onClick={() => navigateEntry(entry)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${indent ? 'pl-4 text-[13px]' : 'text-sm'} ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'} ${baseClass}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {entry.icon ? <entry.icon className="h-4 w-4 shrink-0" /> : null}
          <span className="truncate">{entry.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {renderBadge(entry.badge)}
          {!disabled && entry.section && completedSections.includes(entry.section) && !indent ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
          ) : null}
        </div>
      </button>
    )
  }

  const renderNode = (node: SidebarNode) => {
    const disabled = node.section ? !isSectionEnabled(node.section, capabilities, hideTypeSection) : false
    const active = isNodeActive(node)
    const hasChildren = Boolean(node.children?.length)
    const isExpanded = expandedItems[node.id]
    const baseClass = active
      ? 'bg-[#ff8fa31f] text-white shadow-[inset_0_0_0_1px_rgba(255,143,163,0.24)]'
      : 'text-[#b7a8c2] hover:text-white hover:bg-white/5'

    if (isCollapsed) {
      const Icon = node.icon
      return (
        <button
          key={node.id}
          type="button"
          onClick={() => navigateEntry(node)}
          disabled={disabled}
          title={node.label}
          aria-label={node.label}
          className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'} ${baseClass}`}
        >
          {Icon ? <Icon className="h-5 w-5" /> : <span className="text-xs font-bold">{node.label.charAt(0)}</span>}
          {node.badge ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#ff8fa3]" /> : null}
          {!disabled && node.section && completedSections.includes(node.section) ? <CheckCircle2 className="absolute bottom-1 right-1 h-3 w-3 text-green-400" /> : null}
        </button>
      )
    }

    if (!hasChildren) return renderLeafButton(node)

    return (
      <div key={node.id} className="space-y-1">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigateEntry(node)}
            disabled={disabled}
            className={`flex min-w-0 flex-1 items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'} ${baseClass}`}
          >
            <div className="flex min-w-0 items-center gap-2">
              {node.icon ? <node.icon className="h-4 w-4 shrink-0" /> : null}
              <span className="truncate">{node.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {renderBadge(node.badge)}
              {!disabled && node.section && completedSections.includes(node.section) ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> : null}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setExpandedItems((prev) => ({ ...prev, [node.id]: !prev[node.id] }))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#b7a8c2] transition hover:bg-white/5 hover:text-white"
            aria-label={isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
        {isExpanded ? (
          <div className="ml-6 space-y-1 border-l border-white/8 pl-3">
            {node.children?.map((child) => renderLeafButton(child, true))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <aside className={`h-full w-full overflow-y-auto bg-[linear-gradient(180deg,_#26122f_0%,_#211028_100%)] text-left text-white transition-[width,padding] duration-200 ${isCollapsed ? 'max-w-[5rem] p-3 lg:w-20' : 'max-w-[21rem] p-6 lg:w-80'} ${className ?? ''}`}>
      <div className={`mb-8 flex items-center ${isCollapsed ? 'flex-col justify-center gap-3' : 'justify-between gap-3'}`}>
        <Image
          src={isCollapsed ? "/logos/Gigrilla Gorilla Transparent Cutout.png" : "/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"}
          alt="Gigrilla Logo"
          width={isCollapsed ? 40 : 160}
          height={48}
          className={isCollapsed ? "h-10 w-10 object-contain" : "h-8 w-auto"}
        />
        {onCollapsedChange ? (
          <button
            type="button"
            onClick={() => onCollapsedChange(!isCollapsed)}
            className="hidden h-9 w-9 items-center justify-center rounded-xl text-[#b7a8c2] transition hover:bg-white/5 hover:text-white lg:inline-flex"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5 rotate-90" />}
          </button>
        ) : null}
      </div>

      {groups.map((group) => (
        <div key={group.id} className={isCollapsed ? "mb-3 last:mb-0" : "mb-6 last:mb-0"}>
          <button
            type="button"
            onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
            className={isCollapsed ? "sr-only" : "mb-3 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.32em] text-[#8e7b9d] transition hover:text-white"}
          >
            <span>{group.label}</span>
            {expandedGroups[group.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {isCollapsed || expandedGroups[group.id] ? <div className={isCollapsed ? "flex flex-col items-center gap-2" : "space-y-1"}>{group.items.map(renderNode)}</div> : null}
        </div>
      ))}
    </aside>
  )
}
