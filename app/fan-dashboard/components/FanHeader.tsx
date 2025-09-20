"use client";

import { useEffect, useState } from "react";
import { Search, Bell, ArrowLeft } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getClient } from "../../../lib/supabase/client";

export function FanHeader() {
  const { user, signOut, loading } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");
  const [initial, setInitial] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  useEffect(() => {
    let isMounted = true;
    const loadName = async () => {
      // If auth is still resolving, wait; effect will rerun when ready
      if (loading) return;

      // Optimistic label using available metadata/email
      const optimistic = (user?.user_metadata?.display_name as string)
        || (user?.user_metadata?.username as string)
        || (user?.user_metadata?.first_name as string)
        || user?.email?.split('@')[0]
        || "User";
      if (isMounted) {
        setDisplayName(optimistic);
        setInitial(optimistic?.[0]?.toUpperCase() || 'U');
      }

      if (!user?.id) return;

      try {
        // Use API endpoint instead of direct database query
        console.log('FanHeader: Fetching profile data from API...');
        const apiPromise = fetch('/api/fan-profile')
          .then(response => response.json())
          .then(result => {
            console.log('FanHeader: API response:', result);

            // Transform API response to match expected format
            if (result.data) {
              return {
                data: result.data,
                error: null
              };
            } else {
              return {
                data: null,
                error: { code: 'PGRST116', message: result.message || 'No profile found' }
              };
            }
          })
          .catch(error => {
            console.log('FanHeader: API error:', error);
            return {
              data: null,
              error: {
                code: 'API_ERROR',
                message: error.message || 'API call failed'
              }
            };
          });

        // Query fan_profiles with timeout and maybeSingle
        const profilePromise = apiPromise;

        const timeoutPromise = new Promise(resolve =>
          setTimeout(() => resolve({ data: null, error: { code: 'TIMEOUT' } }), 10000)
        );

        const { data: prof } = await Promise.race([
          profilePromise as Promise<{ data: unknown; error: unknown }>,
          timeoutPromise as Promise<{ data: unknown; error: unknown }>
        ]) as { data: unknown; error: unknown };

        let dbName = (prof as { display_name?: string; username?: string })?.display_name || (prof as { display_name?: string; username?: string })?.username || '';

        if (!dbName) {
          const supabase = getClient();
          const { data: usr } = await supabase
            .from('users')
            .select('display_name, username')
            .eq('id', user.id)
            .maybeSingle();
          dbName = usr?.display_name || usr?.username || dbName;
        }

        const final = dbName || optimistic;
        if (isMounted) {
          setDisplayName(final);
          setInitial(final?.[0]?.toUpperCase() || 'U');
        }
      } catch {
        // Keep optimistic display
      }
    };
    loadName();
    return () => {
      isMounted = false;
    };
  }, [loading, user?.id, user?.email, user?.user_metadata?.first_name, user?.user_metadata?.display_name, user?.user_metadata?.username]);

  // Load avatar URL from users table when user is ready
  useEffect(() => {
    let isMounted = true
    const loadAvatar = async () => {
      if (loading || !user?.id) return
      try {
        const supabase = getClient();
        const { data } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .maybeSingle()
        if (isMounted && data?.avatar_url) setAvatarUrl(data.avatar_url as string)
      } catch {}
    }
    loadAvatar()
    return () => { isMounted = false }
  }, [loading, user?.id])

  const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id) return
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = getClient()
    try {
      const fileExt = file.name.split('.').pop() || 'jpg'
      const path = `${user.id}-${Date.now()}.${fileExt}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = pub?.publicUrl || ''
      if (publicUrl) {
        const { error: updErr } = await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id)
        if (updErr) throw updErr
        setAvatarUrl(publicUrl)
      }
    } catch {
      // swallow errors for now; could add toast
    } finally {
      setUploading(false)
      try { e.target.value = '' } catch {}
    }
  }

  return (
    <div className="flex items-center justify-between p-6 bg-[#2a1b3d]">
      {/* Back Button */}
      <Link
        href="/fan-dashboard"
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Dashboard</span>
      </Link>

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
          <label className="relative cursor-pointer">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">{initial}</span>
              </div>
            )}
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0" onChange={onAvatarFileChange} disabled={uploading} />
          </label>
          <span className="text-white text-sm">{displayName}</span>
          <Link
            href="/login"
            onClick={async (e) => {
              e.preventDefault()
              const nav = () => router.replace('/login')
              const timeout = setTimeout(nav, 500)
              try { await signOut() } finally { clearTimeout(timeout); nav() }
            }}
            className="text-gray-400 hover:text-white text-sm transition-colors relative z-10 pointer-events-auto"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  );
}

