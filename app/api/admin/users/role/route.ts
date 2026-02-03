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

export async function PUT(request: NextRequest) {
    return handleRoleUpdate(request)
}

export async function POST(request: NextRequest) {
    return handleRoleUpdate(request)
}

async function handleRoleUpdate(request: NextRequest) {
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
        const { userId, role } = body

        if (!userId || !role) {
            return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 })
        }

        const validRoles = ['user', 'community_moderator', 'admin', 'super_admin']
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        // Prevent demoting yourself if you are the only super admin or just generally risky
        if (userId === user.id) {
            // Allow if not demoting from super_admin to lower? 
            // For safety, warn or block self-demotion via this API if critical.
            // But for now, let's allow it as admins might want to test permissions.
        }

        // Update user role
        const { data, error } = await supabase
            .from('user_profiles')
            .update({ role })
            .eq('user_id', userId)
            .select()
            .single()

        if (error) {
            console.error('Error updating role:', error)
            return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: `User role updated to ${role}`,
            data
        })

    } catch (error) {
        console.error('Role update API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
