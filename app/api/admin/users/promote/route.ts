import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

async function isAdmin(supabase: any, userId: string): Promise<boolean> {
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', userId)
        .single()

    return profile?.role === 'admin' || profile?.role === 'super_admin'
}

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
        const { email, role } = body

        if (!email || !role) {
            return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
        }

        // First find the user profile by email
        // Note: This relies on user_profiles having email, or querying auth.users if possible (admin only)
        // Supabase client here is limited unless using service role key, but usually user_profiles has email or we can search it.
        // Assuming user_profiles has email column (it does in context).

        const { data: profile, error: searchError } = await supabase
            .from('user_profiles')
            .select('user_id, role')
            .eq('email', email)
            .single()

        if (searchError || !profile) {
            return NextResponse.json({ error: 'User not found with this email' }, { status: 404 })
        }

        // Update the role
        const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ role })
            .eq('user_id', profile.user_id)

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: `User promoted to ${role} successfully`
        })

    } catch (error) {
        console.error('Promote API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
