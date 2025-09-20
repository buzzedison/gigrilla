"use client";

import { useState, useEffect } from "react";
import {
  User,
  Users,
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
  Camera
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth-context";
import { Button } from "../../components/ui/button";

interface ArtistSidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function ArtistSidebar({ activeSection = 'profile', onSectionChange }: ArtistSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [accountType, setAccountType] = useState<string>('artist');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    activities: true,
    administration: true
  });

  const handleSignOut = async () => {
    const nav = () => router.replace('/login');
    const timeout = setTimeout(nav, 500);
    try { await signOut() } finally { clearTimeout(timeout); nav() }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSectionChange = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  const mainMenuItems = [
    { icon: FileText, label: "Main Dashboard", section: "profile" },
  ];

  const activitiesItems = [
    { icon: User, label: "Basic Artist Details", section: "profile" },
    { icon: Users, label: "Artist Members", section: "members" },
    { icon: BookOpen, label: "Artist Biography", section: "bio" },
    { icon: Music, label: "Artist Genres", section: "genres" },
    { icon: Map, label: "GigAbility Maps", section: "maps" },
    { icon: Palette, label: "Logo/Profile Artwork", section: "logo" },
    { icon: ImageIcon, label: "Photos", section: "photos" },
    { icon: Video, label: "Videos", section: "videos" },
    { icon: Settings, label: "Change Artist Type", section: "type" },
  ];

  const administrationItems = [
    { icon: Eye, label: "View Profile", path: "/artist-dashboard?section=view" },
    { icon: Edit3, label: "Edit Profile", path: "/artist-dashboard?section=edit" },
    { icon: User, label: "Manage Admins", path: "/artist-dashboard?section=admins" },
    { icon: CreditCard, label: "Billing & Payments", path: "/artist-dashboard?section=billing" },
    { icon: Settings, label: "Settings", path: "/artist-dashboard?section=settings" },
    { icon: RefreshCw, label: "Switch Accounts", path: "/profile-setup" },
    { icon: LogOut, label: "Log Out", path: "/login", onClick: handleSignOut },
  ];

  return (
    <div className="w-64 bg-[#2a1b3d] h-full flex flex-col p-6 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center mb-8">
        <img
          src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
          alt="Gigrilla Logo"
          className="h-8 w-auto"
        />
      </div>

      {/* EDIT PROFILE Section */}
      <div className="mb-6">
        <h3 className="text-purple-300 text-sm uppercase tracking-wider mb-3 font-medium">EDIT PROFILE</h3>
      </div>

      {/* Main Menu */}
      <div className="mb-6">
        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Main Menu</h3>
        <div className="space-y-1">
          {mainMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSectionChange(item.section)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeSection === item.section
                  ? "bg-purple-600/20 text-white"
                  : "text-gray-400 hover:text-white hover:bg-purple-600/10"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVITIES Section */}
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
            {activitiesItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSectionChange(item.section)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  activeSection === item.section
                    ? "bg-purple-600/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-purple-600/10"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ADMINISTRATION Section */}
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
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg relative z-10 pointer-events-auto text-gray-400 hover:text-white hover:bg-purple-600/10"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ) : (
                <Link
                  key={index}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
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
    </div>
  );
}
