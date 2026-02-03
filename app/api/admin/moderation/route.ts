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
            // Ignore - called from Server Component
          }
        },
      },
    }
  )
}

// Check if user is moderator (community_moderator, admin, or super_admin)
async function isModerator(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()

  return ['community_moderator', 'admin', 'super_admin'].includes(profile?.role)
}

// Check if user is admin (admin or super_admin only)
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()

  return profile?.role === 'admin' || profile?.role === 'super_admin'
}

// POST - Perform moderation action
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      action,
      releaseId,
      targetUserId,
      reason,
      moderatorNotes,
      banType,
      expiresAt
    } = body

    // Validate required fields
    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    const validActions = [
      'flag', 'unflag', 'mark_offensive', 'unmark_offensive',
      'do_not_recommend', 'allow_recommend', 'remove', 'restore',
      'ban_user', 'unban_user'
    ]

    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Check permissions
    const moderatorCheck = await isModerator(supabase, user.id)
    const adminCheck = await isAdmin(supabase, user.id)

    if (!moderatorCheck) {
      return NextResponse.json({
        error: 'Insufficient permissions. Moderator role required.'
      }, { status: 403 })
    }

    // Ban/unban actions require admin role
    if (['ban_user', 'unban_user'].includes(action) && !adminCheck) {
      return NextResponse.json({
        error: 'Insufficient permissions. Admin role required for user bans.'
      }, { status: 403 })
    }

    // Process the moderation action
    switch (action) {
      case 'flag':
        if (!releaseId) {
          return NextResponse.json({ error: 'Release ID required' }, { status: 400 })
        }

        // Update release
        await supabase
          .from('music_releases')
          .update({
            flagged_for_review: true,
            flagged_at: new Date().toISOString(),
            flagged_by: user.id,
            moderation_notes: moderatorNotes || null
          })
          .eq('id', releaseId)

        // Log action
        await supabase
          .from('moderation_actions')
          .insert({
            release_id: releaseId,
            moderator_id: user.id,
            action_type: 'flag',
            reason: reason || null,
            moderator_notes: moderatorNotes || null
          })

        return NextResponse.json({
          success: true,
          message: 'Release flagged for review'
        })

      case 'unflag':
        if (!releaseId) {
          return NextResponse.json({ error: 'Release ID required' }, { status: 400 })
        }

        await supabase
          .from('music_releases')
          .update({
            flagged_for_review: false,
            flagged_at: null,
            flagged_by: null
          })
          .eq('id', releaseId)

        await supabase
          .from('moderation_actions')
          .insert({
            release_id: releaseId,
            moderator_id: user.id,
            action_type: 'unflag',
            reason: reason || null,
            moderator_notes: moderatorNotes || null
          })

        return NextResponse.json({
          success: true,
          message: 'Release unflagged'
        })

      case 'mark_offensive':
        if (!releaseId) {
          return NextResponse.json({ error: 'Release ID required' }, { status: 400 })
        }

        await supabase
          .from('music_releases')
          .update({
            is_offensive: true,
            moderation_notes: moderatorNotes || null
          })
          .eq('id', releaseId)

        await supabase
          .from('moderation_actions')
          .insert({
            release_id: releaseId,
            moderator_id: user.id,
            action_type: 'mark_offensive',
            reason: reason || null,
            moderator_notes: moderatorNotes || null
          })

        return NextResponse.json({
          success: true,
          message: 'Release marked as offensive'
        })

      case 'unmark_offensive':
        if (!releaseId) {
          return NextResponse.json({ error: 'Release ID required' }, { status: 400 })
        }

        await supabase
          .from('music_releases')
          .update({
            is_offensive: false
          })
          .eq('id', releaseId)

        await supabase
          .from('moderation_actions')
          .insert({
            release_id: releaseId,
            moderator_id: user.id,
            action_type: 'unmark_offensive',
            reason: reason || null,
            moderator_notes: moderatorNotes || null
          })

        return NextResponse.json({
          success: true,
          message: 'Release unmarked as offensive'
        })

      case 'do_not_recommend':
        if (!releaseId) {
          return NextResponse.json({ error: 'Release ID required' }, { status: 400 })
        }

        await supabase
          .from('music_releases')
          .update({
            do_not_recommend: true,
            moderation_notes: moderatorNotes || null
          })
          .eq('id', releaseId)

        await supabase
          .from('moderation_actions')
          .insert({
            release_id: releaseId,
            moderator_id: user.id,
            action_type: 'do_not_recommend',
            reason: reason || null,
            moderator_notes: moderatorNotes || null
          })

        return NextResponse.json({
          success: true,
          message: 'Release marked as do not recommend'
        })

      case 'allow_recommend':
        if (!releaseId) {
          return NextResponse.json({ error: 'Release ID required' }, { status: 400 })
        }

        await supabase
          .from('music_releases')
          .update({
            do_not_recommend: false
          })
          .eq('id', releaseId)

        await supabase
          .from('moderation_actions')
          .insert({
            release_id: releaseId,
            moderator_id: user.id,
            action_type: 'allow_recommend',
            reason: reason || null,
            moderator_notes: moderatorNotes || null
          })

        return NextResponse.json({
          success: true,
          message: 'Release allowed for recommendations'
        })

      case 'remove':
        if (!releaseId) {
          return NextResponse.json({ error: 'Release ID required' }, { status: 400 })
        }

        await supabase
          .from('music_releases')
          .update({
            removed_at: new Date().toISOString(),
            removed_by: user.id,
            moderation_notes: moderatorNotes || null,
            status: 'draft' // Move back to draft to hide from public
          })
          .eq('id', releaseId)

        await supabase
          .from('moderation_actions')
          .insert({
            release_id: releaseId,
            moderator_id: user.id,
            action_type: 'remove',
            reason: reason || null,
            moderator_notes: moderatorNotes || null
          })

        return NextResponse.json({
          success: true,
          message: 'Release removed from public view'
        })

      case 'restore':
        if (!releaseId) {
          return NextResponse.json({ error: 'Release ID required' }, { status: 400 })
        }

        await supabase
          .from('music_releases')
          .update({
            removed_at: null,
            removed_by: null,
            status: 'published' // Restore to published status
          })
          .eq('id', releaseId)

        await supabase
          .from('moderation_actions')
          .insert({
            release_id: releaseId,
            moderator_id: user.id,
            action_type: 'restore',
            reason: reason || null,
            moderator_notes: moderatorNotes || null
          })

        return NextResponse.json({
          success: true,
          message: 'Release restored to public view'
        })

      case 'ban_user':
        if (!targetUserId) {
          return NextResponse.json({ error: 'Target user ID required' }, { status: 400 })
        }

        if (!reason) {
          return NextResponse.json({ error: 'Ban reason required' }, { status: 400 })
        }

        // Check if user already has an active ban
        const { data: existingBan } = await supabase
          .from('user_bans')
          .select('*')
          .eq('user_id', targetUserId)
          .eq('is_active', true)
          .single()

        if (existingBan) {
          return NextResponse.json({
            error: 'User already has an active ban'
          }, { status: 400 })
        }

        // Create ban record
        const banData: Record<string, any> = {
          user_id: targetUserId,
          banned_by: user.id,
          ban_reason: reason,
          ban_type: banType || 'permanent',
          admin_notes: moderatorNotes || null,
          banned_at: new Date().toISOString(),
          is_active: true
        }

        if (banType === 'temporary' && expiresAt) {
          banData.expires_at = expiresAt
        }

        await supabase
          .from('user_bans')
          .insert(banData)

        // Log action
        await supabase
          .from('moderation_actions')
          .insert({
            user_id: targetUserId,
            moderator_id: user.id,
            action_type: 'ban_user',
            reason: reason,
            moderator_notes: moderatorNotes || null
          })

        return NextResponse.json({
          success: true,
          message: `User banned (${banType})`
        })

      case 'unban_user':
        if (!targetUserId) {
          return NextResponse.json({ error: 'Target user ID required' }, { status: 400 })
        }

        // Update active ban to inactive
        await supabase
          .from('user_bans')
          .update({
            is_active: false,
            unbanned_at: new Date().toISOString(),
            unbanned_by: user.id,
            unban_reason: reason || null
          })
          .eq('user_id', targetUserId)
          .eq('is_active', true)

        // Log action
        await supabase
          .from('moderation_actions')
          .insert({
            user_id: targetUserId,
            moderator_id: user.id,
            action_type: 'unban_user',
            reason: reason || null,
            moderator_notes: moderatorNotes || null
          })

        return NextResponse.json({
          success: true,
          message: 'User unbanned'
        })

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

  } catch (error) {
    console.error('API: Moderation error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Fetch moderation history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const moderatorCheck = await isModerator(supabase, user.id)
    if (!moderatorCheck) {
      return NextResponse.json({
        error: 'Insufficient permissions. Moderator role required.'
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const releaseId = searchParams.get('releaseId')
    const userId = searchParams.get('userId')
    const actionType = searchParams.get('actionType')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = supabase
      .from('moderation_actions')
      .select(`
        *,
        moderator:moderator_id (
          id,
          email
        )
      `)
      .order('action_taken_at', { ascending: false })
      .limit(limit)

    if (releaseId) {
      query = query.eq('release_id', releaseId)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (actionType) {
      query = query.eq('action_type', actionType)
    }

    const { data, error } = await query

    if (error) {
      console.error('API: Error fetching moderation actions:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ data })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
