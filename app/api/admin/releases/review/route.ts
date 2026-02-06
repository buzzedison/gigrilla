import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/service-client'

const resend = new Resend(process.env.RESEND_API_KEY)

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

// POST - Approve or reject a release
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminCheck = await isAdmin(supabase, user.id)
    if (!adminCheck) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      releaseId,
      action, // 'approve', 'reject', 'request_changes', 'publish'
      adminNotes,
      rejectionReason,
      changesRequested
    } = body

    // Validate required fields
    if (!releaseId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: releaseId, action' },
        { status: 400 }
      )
    }

    // Validate action
    const validActions = ['approve', 'reject', 'request_changes', 'publish']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      )
    }

    // Get the release
    const { data: release, error: releaseError } = await supabase
      .from('music_releases')
      .select('*')
      .eq('id', releaseId)
      .single()

    if (releaseError || !release) {
      return NextResponse.json(
        { error: 'Release not found' },
        { status: 404 }
      )
    }

    let artistStageName = 'Artist'
    try {
      const serviceSupabase = createServiceClient()
      const { data: artistProfile } = await serviceSupabase
        .from('user_profiles')
        .select('stage_name')
        .eq('user_id', release.user_id)
        .eq('profile_type', 'artist')
        .maybeSingle()

      if (artistProfile?.stage_name) {
        artistStageName = artistProfile.stage_name
      }
    } catch (profileLookupError) {
      console.warn('Could not resolve artist stage name for review email:', profileLookupError)
    }

    // Determine new status based on action
    let newStatus: string
    switch (action) {
      case 'approve':
        // In the current workflow, admin approval should publish immediately.
        newStatus = 'published'
        break
      case 'reject':
        newStatus = 'rejected'
        break
      case 'request_changes':
        newStatus = 'draft'
        break
      case 'publish':
        newStatus = 'published'
        break
      default:
        newStatus = release.status
    }

    const previousStatus = release.status
    const now = new Date().toISOString()

    // Update the release
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      reviewed_at: now,
      reviewed_by: user.id,
      rejection_reason: action === 'reject' ? rejectionReason : null,
      admin_notes: adminNotes || null,
      updated_at: now
    }

    if (newStatus === 'published') {
      updatePayload.published_at = now
      if (!release.submitted_at) {
        updatePayload.submitted_at = now
      }
    }

    const { error: updateError } = await supabase
      .from('music_releases')
      .update(updatePayload)
      .eq('id', releaseId)

    if (updateError) {
      console.error('Error updating release:', updateError)
      return NextResponse.json(
        { error: 'Failed to update release' },
        { status: 500 }
      )
    }

    // Create review record
    const { error: reviewError } = await supabase
      .from('music_release_reviews')
      .insert({
        release_id: releaseId,
        reviewer_id: user.id,
        previous_status: previousStatus,
        new_status: newStatus,
        action,
        admin_notes: adminNotes || null,
        rejection_reason: rejectionReason || null,
        changes_requested: changesRequested || null,
        reviewed_at: now
      })

    if (reviewError) {
      console.error('Error creating review record:', reviewError)
      // Don't fail the request, just log
    }

    // Send email notification to artist
    try {
      const { data: artistUser } = await supabase.auth.admin.getUserById(release.user_id)

      if (artistUser?.user?.email) {
        await sendReviewNotificationEmail({
          artistEmail: artistUser.user.email,
          artistName: artistStageName,
          releaseTitle: release.release_title,
          action,
          rejectionReason,
          changesRequested,
          adminNotes
        })
      }
    } catch (emailError) {
      console.error('Error sending notification email:', emailError)
      // Don't fail the request
    }

    return NextResponse.json({
      success: true,
      message: `Release ${action}d successfully`,
      data: {
        releaseId,
        previousStatus,
        newStatus,
        action
      }
    })

  } catch (error) {
    console.error('Admin review API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Send review notification email
async function sendReviewNotificationEmail({
  artistEmail,
  artistName,
  releaseTitle,
  action,
  rejectionReason,
  changesRequested,
  adminNotes
}: {
  artistEmail: string
  artistName: string
  releaseTitle: string
  action: string
  rejectionReason?: string
  changesRequested?: string
  adminNotes?: string
}) {
  const actionMessages = {
    approve: {
      subject: `Your release "${releaseTitle}" has been approved!`,
      title: 'Release Approved',
      message: 'Congratulations! Your release has been approved and is ready to go live.',
      color: '#10b981'
    },
    reject: {
      subject: `Update required for "${releaseTitle}"`,
      title: 'Release Needs Attention',
      message: 'Your release requires some updates before it can be approved.',
      color: '#ef4444'
    },
    request_changes: {
      subject: `Changes requested for "${releaseTitle}"`,
      title: 'Changes Requested',
      message: 'Please review the requested changes and resubmit your release.',
      color: '#f59e0b'
    },
    publish: {
      subject: `"${releaseTitle}" is now live!`,
      title: 'Release Published',
      message: 'Your release is now live on Gigrilla!',
      color: '#8b5cf6'
    }
  }

  const config = actionMessages[action as keyof typeof actionMessages]

  const html = `
    <div style="font-family:Inter,Segoe UI,sans-serif;background:#0f172a;color:#e2e8f0;padding:40px 24px">
      <div style="max-width:560px;margin:0 auto">
        <div style="background:#111827;border-radius:16px;padding:32px;border:1px solid #1f2937">
          <h1 style="margin:0 0 16px 0;font-size:24px;color:#f8fafc">${config.title}</h1>

          <p style="margin:0 0 16px 0">Hi ${artistName},</p>

          <p style="margin:0 0 24px 0;line-height:1.6">
            ${config.message}
          </p>

          <div style="background:#1f2937;border-left:4px solid ${config.color};padding:16px;margin:24px 0;border-radius:8px">
            <p style="margin:0 0 8px 0;font-weight:600;color:${config.color}">Release: ${releaseTitle}</p>
          </div>

          ${rejectionReason ? `
            <div style="background:#7f1d1d;border-left:4px solid #ef4444;padding:16px;margin:24px 0;border-radius:8px">
              <p style="margin:0 0 8px 0;font-weight:600">Reason:</p>
              <p style="margin:0;color:#fca5a5">${rejectionReason}</p>
            </div>
          ` : ''}

          ${changesRequested ? `
            <div style="background:#78350f;border-left:4px solid #f59e0b;padding:16px;margin:24px 0;border-radius:8px">
              <p style="margin:0 0 8px 0;font-weight:600">Changes Requested:</p>
              <p style="margin:0;color:#fcd34d">${changesRequested}</p>
            </div>
          ` : ''}

          ${adminNotes ? `
            <div style="background:#1f2937;padding:16px;margin:24px 0;border-radius:8px">
              <p style="margin:0 0 8px 0;font-weight:600;color:#94a3b8">Admin Notes:</p>
              <p style="margin:0;color:#cbd5e1">${adminNotes}</p>
            </div>
          ` : ''}

          <div style="text-align:center;margin:32px 0">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://gigrilla.com'}/artist-dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#a855f7,#ec4899);color:white;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:600;font-size:16px">
              View in Dashboard
            </a>
          </div>
        </div>

        <p style="text-align:center;color:#64748b;font-size:12px;margin-top:32px">
          © ${new Date().getFullYear()} Gigrilla. All rights reserved.
        </p>
      </div>
    </div>
  `

  if (!process.env.RESEND_API_KEY) {
    console.log('Email would be sent:', config.subject)
    return
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@updates.gigrilla.com',
    to: artistEmail,
    subject: config.subject,
    html
  })
}
