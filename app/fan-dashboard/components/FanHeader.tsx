"use client";

import { useEffect, useState } from "react";
import { Search, Bell, ArrowLeft } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export function FanHeader() {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");
  const [initial, setInitial] = useState<string>("U");
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleBackToDashboard = () => {
    router.push('/fan-dashboard');
  };

  useEffect(() => {
    let isMounted = true;
    const loadName = async () => {
      // Set an immediate optimistic fallback while we fetch
      const optimistic = (user?.user_metadata?.first_name as string) || user?.email?.split('@')[0] || "User";
      if (isMounted) {
        setDisplayName(optimistic);
        setInitial(optimistic?.[0]?.toUpperCase() || 'U');
      }

      if (!user?.id) return;

      const supabase = createClient();
      // 1) Try user_profiles first
      const { data: prof, error: profError } = await supabase
        .from('user_profiles')
        .select('display_name, username')
        .eq('user_id', user.id)
        .eq('profile_type', 'fan')
        .single();

      let dbName = prof?.display_name || prof?.username || '';

      // 2) Fallback to users table if needed
      if ((!dbName || profError) && user.id) {
        const { data: usr, error: usrError } = await supabase
          .from('users')
          .select('display_name, username')
          .eq('id', user.id)
          .single();
        if (!usrError) dbName = usr?.display_name || usr?.username || dbName;
      }

      const final = dbName || optimistic;
      if (isMounted) {
        setDisplayName(final);
        setInitial(final?.[0]?.toUpperCase() || 'U');
      }
    };
    loadName();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email, user?.user_metadata?.first_name]);

  return (
    <div className="flex items-center justify-between p-6 bg-[#2a1b3d]">
      {/* Back Button */}
      <button
        onClick={handleBackToDashboard}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Dashboard</span>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#1a1a2e] border border-gray-600 rounded-full pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-white">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">{initial}</span>
          </div>
          <span className="text-white text-sm">{displayName}</span>
          <button
            onClick={handleSignOut}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

