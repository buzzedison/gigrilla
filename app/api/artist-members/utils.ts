import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface ArtistProfileRecord {
  id: string
  stage_name: string | null
  artist_primary_roles: string[] | null
}

export async function createSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll may be called from a Server Component; middleware will refresh cookies.
          }
        }
      }
    }
  )
}

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    return { supabase, user: null, error }
  }

  return { supabase, user, error: null }
}

export async function getArtistProfile(
  supabase: Awaited<ReturnType<typeof createSupabaseClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, stage_name, artist_primary_roles')
    .eq('user_id', userId)
    .eq('profile_type', 'artist')
    .maybeSingle()

  if (error) {
    return { profile: null, error }
  }

  return { profile: (data as ArtistProfileRecord | null) ?? null, error: null }
}


