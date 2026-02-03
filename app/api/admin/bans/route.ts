import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Helper to create Supabase client
async function createSupabaseClient() {
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
                        // Ignore
                    }
                },
            },
        }
    )
}

// Check if user is admin
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single()

    return profile?.role === 'admin' || profile?.role === 'super_admin'
}

// GET - Fetch pending ban requests or banned users
export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminCheck = await isAdmin(supabase, user.id)
        if (!adminCheck) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Fetch banned users from user_bans table joined with user_profiles
        const { data: bannedUsers, error } = await supabase
            .from('user_bans')
            .select(`
                *,
                user:user_profiles!user_bans_user_id_fkey (
                    email,
                    full_name,
                    role
                )
            `)
            .eq('is_active', true)
            .order('banned_at', { ascending: false })

        if (error) {
            console.error('Error fetching banned users:', error)
            return NextResponse.json({ error: 'Failed to fetch banned users' }, { status: 500 })
        }

        // Transform data to match frontend expectation
        const formattedUsers = bannedUsers?.map((ban: any) => ({
            id: ban.id,
            user_id: ban.user_id,
            email: ban.user?.email || 'Unknown',
            full_name: ban.user?.full_name || 'Unknown',
            is_banned: true,
            ban_reason: ban.ban_reason,
            banned_at: ban.banned_at
        })) || []

        return NextResponse.json({ success: true, users: formattedUsers })

    } catch (error) {
        console.error('Bans API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Ban or Unban a user
export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const adminCheck = await isAdmin(supabase, user.id)
        if (!adminCheck) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { userId, action, reason } = body // action: 'ban' | 'unban'

        if (!userId || !action) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (action === 'ban') {
            if (!reason) {
                return NextResponse.json({ error: 'Ban reason is required' }, { status: 400 })
            }

            // Create new ban record
            const { error: banError } = await supabase
                .from('user_bans')
                .insert({
                    user_id: userId,
                    banned_by: user.id,
                    ban_reason: reason,
                    is_active: true
                })

            if (banError) {
                console.error('Error banning user:', banError)
                return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 })
            }
        } else if (action === 'unban') {
            // Deactivate active bans
            const { error: unbanError } = await supabase
                .from('user_bans')
                .update({
                    is_active: false,
                    unbanned_at: new Date().toISOString(),
                    unbanned_by: user.id
                })
                .eq('user_id', userId)
                .eq('is_active', true)

            if (unbanError) {
                console.error('Error unbanning user:', unbanError)
                return NextResponse.json({ error: 'Failed to unban user' }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true, message: `User ${action}ned successfully` })

    } catch (error) {
        console.error('Ban action error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
