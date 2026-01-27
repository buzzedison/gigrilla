"use client";

import { useEffect, useState } from "react";
import { Search, Bell, ArrowLeft, Menu } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../../../lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getClient } from "../../../lib/supabase/client";

interface FanHeaderProps {
  onOpenSidebar?: () => void
}

export function FanHeader({ onOpenSidebar }: FanHeaderProps) {
  const { user, signOut, loading } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");
  const [initial, setInitial] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const router = useRouter();

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

  // Load avatar URL from fan_profiles when user is ready
  useEffect(() => {
    let isMounted = true
    const loadAvatar = async () => {
      if (loading || !user?.id) return
      try {
        // Use API endpoint to get avatar
        const response = await fetch('/api/fan-profile')
        const result = await response.json()
        if (isMounted && result.data?.avatar_url) {
          setAvatarUrl(result.data.avatar_url as string)
        }
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
    try {
      // Upload to Cloudflare R2 via API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await uploadResponse.json()
      const publicUrl = result.url

      if (publicUrl) {
        // Update fan_profiles via API
        const response = await fetch('/api/fan-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: publicUrl })
        })
        if (!response.ok) throw new Error('Failed to update avatar')
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
    <div className="bg-[#2a1b3d] font-ui">
      <div className="mx-auto flex w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:max-w-6xl lg:flex-row lg:items-center lg:justify-between lg:py-6">
        <div className="flex items-center gap-3">
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a2e] text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#2a1b3d] lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link
            href="/fan-dashboard"
            className="flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
        </div>

        <div className="w-full md:max-w-md lg:flex-1 lg:max-w-xl">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full border border-gray-600 bg-[#1a1a2e] py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button className="rounded-full p-2 text-gray-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#2a1b3d]">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600">
                  <span className="text-sm text-white">{initial}</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0"
                onChange={onAvatarFileChange}
                disabled={uploading}
              />
            </label>
            <span className="text-sm text-white">{displayName}</span>
            <Link
              href="/login"
              onClick={async (e) => {
                e.preventDefault();
                const nav = () => router.replace('/login');
                const timeout = setTimeout(nav, 500);
                try {
                  await signOut();
                } finally {
                  clearTimeout(timeout);
                  nav();
                }
              }}
              className="relative z-10 text-sm text-gray-300 transition-colors hover:text-white"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
