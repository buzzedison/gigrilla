"use client";

import { useState, useEffect } from "react";
import { Settings, User, Image, Video, CreditCard, LogOut, RefreshCw, Eye, Edit3, Menu, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth-context";
import { createClient } from "../../../lib/supabase/client";

export function FanSidebar() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [accountType, setAccountType] = useState<string>('guest');
  const [completion, setCompletion] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadAccountType = async () => {
      try {
        if (!user?.id) return;
        const supabase = createClient();
        const { data, error } = await supabase.rpc('get_fan_completion_status');
        if (error) {
          console.warn('FanSidebar: Failed to fetch completion status, defaulting to guest:', error);
          if (isMounted) {
            setAccountType('guest');
            setCompletion(0);
            setIsComplete(false);
          }
          return;
        }
        if (isMounted) {
          setAccountType((data?.account_type as string) ?? 'guest');
          setCompletion((data?.completion_percent as number) ?? 0);
          setIsComplete((data?.is_complete as boolean) ?? false);
        }
      } catch (e) {
        console.warn('FanSidebar: Exception fetching account_type, defaulting to guest:', e);
        if (isMounted) setAccountType('guest');
      }
    };
    loadAccountType();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleUpgrade = () => {
    router.push('/upgrade?type=full-fan');
  };

  const menuItems = [
    { icon: Menu, label: "Main Dashboard", active: false, onClick: () => router.push('/fan-dashboard') },
  ];

  const activities = [
    { icon: User, label: "About You", active: true, onClick: () => {} },
    { icon: Image, label: "Profile Pictures", active: false, onClick: () => {} },
    { icon: Image, label: "Photos", active: false, onClick: () => {} },
    { icon: Video, label: "Videos", active: false, onClick: () => {} },
  ];

  const administration = [
    { icon: Eye, label: "View Profile", active: false, onClick: () => {} },
    { icon: Edit3, label: "Edit Profile", active: false, onClick: () => {} },
    { icon: CreditCard, label: "Billing & Payments", active: false, onClick: () => {} },
    { icon: Settings, label: "Settings", active: false, onClick: () => {} },
    { icon: RefreshCw, label: "Switch Accounts", active: false, onClick: () => {} },
    { icon: LogOut, label: "Log Out", active: false, onClick: handleSignOut },
  ];

  return (
    <div className="w-64 bg-[#2a1b3d] h-full flex flex-col p-6">
      {/* Logo */}
      <div className="flex items-center mb-8">
        <img
          src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
          alt="Gigrilla Logo"
          className="h-8 w-auto"
        />
      </div>

            {/* Upgrade Prompt - Only show for guest users */}
            {accountType === 'guest' && (
        <div className="mb-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">Complete Full Fan Setup</span>
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
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">Full Fan Status</span>
          </div>
          <p className="text-gray-300 text-xs">
            You have access to all fan features!
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
              onClick={item.onClick}
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
              onClick={item.onClick}
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
            <div
              key={index}
              onClick={item.onClick}
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
    </div>
  );
}

