"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, User, Image as ImageIcon, Video, CreditCard, LogOut, RefreshCw, Eye, Edit3, Menu, Crown, ArrowRightLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth-context";
import { cn } from "../../components/ui/utils";
import NextImage from "next/image";

interface FanSidebarProps {
  onNavigate?: () => void
  className?: string
}

export function FanSidebar({ onNavigate, className }: FanSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [accountType, setAccountType] = useState<string>('guest');

  const loadAccountType = useCallback(async () => {
    try {
      if (!user?.id) return;
      console.log('FanSidebar: Fetching fan status from API...');
      const response = await fetch('/api/fan-status');
      const result = await response.json();

      if (result.error) {
        console.error('FanSidebar: API error:', result);
        const error = { message: result.details || result.error };
        throw error;
      }

      const { data, error } = result;
      if (error) {
        console.warn('FanSidebar: Failed to fetch completion status, defaulting to guest:', error);
        setAccountType('guest');
        return;
      }
      setAccountType((data?.account_type as string) ?? 'guest');
    } catch (e) {
      console.warn('FanSidebar: Exception fetching account_type, defaulting to guest:', e);
      setAccountType('guest');
    }
  }, [user?.id]);

  useEffect(() => {
    loadAccountType();
  }, [user?.id, loadAccountType]);

  // Refresh account type when pathname changes (e.g., returning from payment)
  useEffect(() => {
    if (pathname === '/fan-dashboard') {
      console.log('FanSidebar: Returned to dashboard, refreshing account type...');
      loadAccountType();
    }
  }, [pathname, loadAccountType]);

  // Listen for page focus to refresh account type (when user returns from payment)
  useEffect(() => {
    const handleFocus = () => {
      console.log('FanSidebar: Page focused, refreshing account type...');
      loadAccountType();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id, loadAccountType]);

  const handleSignOut = async () => {
    const nav = () => router.replace('/login');
    const timeout = setTimeout(nav, 500);
    try {
      await signOut()
    } finally {
      clearTimeout(timeout);
      nav();
      onNavigate?.();
    }
  };

  const handleUpgrade = () => {
    router.push('/upgrade?type=full-fan');
    onNavigate?.();
  };

  const menuItems = [
    { icon: Menu, label: "Main Dashboard", active: false, onClick: () => router.replace('/fan-dashboard') },
  ];

  const activities = [
    { icon: User, label: "About You", active: true, onClick: () => {} },
    { icon: ImageIcon, label: "Profile Pictures", active: false, onClick: () => {} },
    { icon: ImageIcon, label: "Photos", active: false, onClick: () => {} },
    { icon: Video, label: "Videos", active: false, onClick: () => {} },
  ];

  const administration = [
    { icon: Eye, label: "View Profile", active: false, onClick: () => {} },
    { icon: Edit3, label: "Edit Profile", active: false, onClick: () => {} },
    { icon: CreditCard, label: "Billing & Payments", active: false, onClick: () => {} },
    { icon: Settings, label: "Settings", active: false, onClick: () => {} },
    { icon: ArrowRightLeft, label: "Switch Profile", active: false, onClick: () => router.push('/profile-setup') },
    { icon: LogOut, label: "Log Out", active: false, onClick: handleSignOut },
  ];

  const runNavigate = (callback: () => void | Promise<void>) => {
    return () => {
      const result = callback();
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        (result as Promise<unknown>).finally(() => onNavigate?.());
      } else {
        onNavigate?.();
      }
    };
  };

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-y-auto bg-[#2a1b3d] p-4 text-white sm:p-6 lg:w-72 lg:min-w-[18rem] font-ui",
        className
      )}
    >
      {/* Logo */}
      <div className="mb-6 flex items-center gap-3 sm:mb-8">
        <NextImage
          src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
          alt="Gigrilla Logo"
          width={160}
          height={48}
          className="h-8 w-auto"
          priority
        />
      </div>

            {/* Upgrade Prompt - Only show for guest users */}
            {accountType === 'guest' && (
        <div className="mb-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">Complete Full Fan Setup</span>
            </div>
            <button
              onClick={loadAccountType}
              className="text-gray-400 hover:text-purple-400 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <p className="text-gray-300 text-xs mb-3">
            Unlock streaming, playlists, commerce, and more!
          </p>
          <button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs py-2 px-3 rounded transition-colors"
          >
            Upgrade Now (£1)
          </button>
        </div>
      )}

            {/* Full Fan Status - Show for full fans */}
            {accountType === 'full' && (
        <div className="mb-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">Super Fan Activated! 🎉</span>
            </div>
            <button
              onClick={loadAccountType}
              className="text-gray-400 hover:text-green-400 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <p className="text-gray-300 text-xs">
            Streaming, playlists, commerce & more unlocked!
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="mb-6">
        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Navigation</h3>
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={runNavigate(item.onClick)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                item.active ? "bg-purple-600/20 text-white" : "text-gray-400 hover:text-white hover:bg-purple-600/10"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="mb-6">
        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Profile</h3>
        <div className="space-y-1">
          {activities.map((item, index) => (
            <div
              key={index}
              onClick={runNavigate(item.onClick)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer ${
                item.active ? "bg-purple-600/20 text-white" : "text-gray-400 hover:text-white hover:bg-purple-600/10"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Administration */}
      <div className="flex-1">
        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Account</h3>
        <div className="space-y-1">
          {administration.map((item, index) => (
            item.label === 'Log Out' ? (
              <Link
                key={index}
                href="/login"
                onClick={async (e) => {
                  e.preventDefault();
                  await handleSignOut();
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg relative z-10 pointer-events-auto ${
                  item.active ? "bg-purple-600/20 text-white" : "text-gray-400 hover:text-white hover:bg-purple-600/10"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm text-left flex-1">{item.label}</span>
              </Link>
            ) : (
              <button
                key={index}
                type="button"
                onClick={runNavigate(item.onClick)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                  item.active ? "bg-purple-600/20 text-white" : "text-gray-400 hover:text-white hover:bg-purple-600/10"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm text-left flex-1">{item.label}</span>
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
