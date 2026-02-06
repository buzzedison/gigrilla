import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

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

// Check if user is admin
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .single()

  return profile?.role === 'admin' || profile?.role === 'super_admin'
}

// Check if user is banned
async function isUserBanned(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase.rpc('is_user_banned', { p_user_id: userId })
  return data === true
}

// Get current approval mode from platform settings
function parseApprovalMode(value: unknown): 'auto' | 'manual' | null {
  const mode =
    typeof value === 'string'
      ? value
      : typeof value === 'object' && value !== null && 'mode' in value
        ? (value as { mode?: unknown }).mode
        : null

  if (mode === 'auto' || mode === 'manual') {
    return mode
  }

  return null
}

async function getApprovalMode(supabase: any): Promise<'auto' | 'manual'> {
  // Try user-scoped client first.
  const { data, error } = await supabase
    .from('platform_settings')
    .select('setting_value')
    .eq('setting_key', 'approval_mode')
    .single()

  const userScopedMode = parseApprovalMode(data?.setting_value)
  if (!error && userScopedMode) {
    return userScopedMode
  }

  // Fallback to service role to avoid RLS-related misses for non-admin submitters.
  try {
    const serviceSupabase = createServiceClient()
    const { data: serviceData, error: serviceError } = await serviceSupabase
      .from('platform_settings')
      .select('setting_value')
      .eq('setting_key', 'approval_mode')
      .single()

    const serviceMode = parseApprovalMode(serviceData?.setting_value)
    if (!serviceError && serviceMode) {
      return serviceMode
    }
  } catch (serviceClientError) {
    console.warn('API: Service client unavailable for approval mode lookup', serviceClientError)
  }

  // Default to auto for beta.
  return 'auto'
}

// GET - Fetch user's music releases
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const releaseId = searchParams.get('id')
    const status = searchParams.get('status')
    const approvalMode = await getApprovalMode(supabase)

    // Check if user is admin
    const adminCheck = await isAdmin(supabase, user.id)

    // Fetch single release by ID
    if (releaseId) {
      let data: any = null
      let error: any = null

      if (adminCheck) {
        // Admin access must use service role to bypass RLS for non-owned releases.
        try {
          const serviceSupabase = createServiceClient()
          const result = await serviceSupabase
            .from('music_releases')
            .select('*')
            .eq('id', releaseId)
            .maybeSingle()
          data = result.data
          error = result.error
        } catch (serviceError) {
          console.error('API: Service client error fetching admin music release:', serviceError)
          return NextResponse.json({
            error: 'Internal server error',
            details: serviceError instanceof Error ? serviceError.message : 'Unknown service error'
          }, { status: 500 })
        }
      } else {
        const result = await supabase
          .from('music_releases')
          .select('*')
          .eq('id', releaseId)
          .eq('user_id', user.id)
          .maybeSingle()
        data = result.data
        error = result.error
      }

      if (error) {
        console.error('API: Error fetching music release:', error)
        return NextResponse.json({
          error: 'Database error',
          details: error.message
        }, { status: 500 })
      }

      if (!data) {
        return NextResponse.json({
          error: 'Release not found'
        }, { status: 404 })
      }

      return NextResponse.json({ data, user_id: user.id, approval_mode: approvalMode })
    }

    // Fetch all releases with optional status filter
    let query = supabase
      .from('music_releases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      if (status === 'published') {
        query = query.in('status', ['published', 'approved'])
      } else {
        query = query.eq('status', status)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('API: Error fetching music releases:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({ data, user_id: user.id, approval_mode: approvalMode })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Create or update a music release
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is banned
    const banned = await isUserBanned(supabase, user.id)
    if (banned) {
      return NextResponse.json({
        error: 'Your account has been banned and cannot submit content.'
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      id,
      upc,
      upc_confirmed,
      ean,
      ean_confirmed,
      release_title,
      release_title_confirmed,
      release_title_source,
      release_type,
      track_count,
      track_count_label,
      release_version,
      apply_version_to_all,
      country_of_origin,
      available_home,
      available_specific,
      available_worldwide,
      specific_territories,
      territory_rights_confirmed,
      go_live_option,
      go_live_date,
      master_rights_type,
      record_labels,
      master_rights_confirmed,
      publishing_rights_type,
      publishers,
      apply_publisher_to_all_tracks,
      publishing_rights_confirmed,
      distributor_name,
      distributor_confirmed,
      distributor_contact_name,
      distributor_contact_email,
      wrote_composition,
      pro_name,
      pro_confirmed,
      pro_contact_name,
      pro_contact_email,
      mcs_name,
      mcs_confirmed,
      mcs_contact_name,
      mcs_contact_email,
      cover_artwork_url,
      cover_caption,
      status,
      current_step,
      upload_guide_confirmed,
      agree_terms_of_use,
      agree_distribution_policy,
      agree_privacy_policy,
      confirm_details_true,
      confirm_legal_liability,
      confirm_no_other_artist_name,
      signatory_role,
      signatory_first_name,
      signatory_middle_names,
      signatory_last_name,
      signatory_email
    } = body

    // Get approval mode from platform settings
    const approvalMode = await getApprovalMode(supabase)

    // In manual mode, never allow direct publish from client payload.
    const requestedStatus = status === 'published' && approvalMode === 'manual'
      ? 'pending_review'
      : status

    // Read existing row early (for updates) so we can safely handle status/timestamp transitions.
    let existingRelease: { status: string | null; submitted_at: string | null; published_at: string | null } | null = null
    if (id) {
      const { data: existingData, error: existingError } = await supabase
        .from('music_releases')
        .select('status, submitted_at, published_at')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingError) {
        console.error('API: Error fetching existing music release:', existingError)
        return NextResponse.json({
          error: 'Database error',
          details: existingError.message
        }, { status: 500 })
      }

      if (!existingData) {
        return NextResponse.json({
          error: 'Release not found or unauthorized'
        }, { status: 404 })
      }

      existingRelease = existingData
    }

    // Gate: release cannot be submitted without Ts&Cs and digital signature
    // Check if this is a submission (status change to pending_review or published)
    const isSubmission = requestedStatus === 'pending_review' || requestedStatus === 'published'

    if (isSubmission) {
      const termsOk =
        agree_terms_of_use === true &&
        agree_distribution_policy === true &&
        agree_privacy_policy === true
      const confirmOk =
        confirm_details_true === true &&
        confirm_legal_liability === true &&
        confirm_no_other_artist_name === true
      const roleOk =
        signatory_role === 'owner' || signatory_role === 'representative'
      const first = typeof signatory_first_name === 'string' && signatory_first_name.trim().length > 0
      const last = typeof signatory_last_name === 'string' && signatory_last_name.trim().length > 0
      const emailOk =
        typeof signatory_email === 'string' &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signatory_email.trim())
      if (!termsOk || !confirmOk || !roleOk || !first || !last || !emailOk) {
        return NextResponse.json(
          {
            success: false,
            error: 'Submission requires all Ts&Cs confirmations and a complete digital signature (first name, last name, email).'
          },
          { status: 400 }
        )
      }
    }

    // HYBRID APPROVAL LOGIC:
    // Phase 1 (Beta - Auto-approval): When status is set to 'pending_review',
    // automatically change it to 'published' if approval mode is 'auto'
    let finalStatus = requestedStatus
    if (requestedStatus === 'pending_review' && approvalMode === 'auto') {
      finalStatus = 'published'
    }

    // Protect against accidental downgrade from auto-save after submit/publish.
    // Once a release is in pending/published/approved, autosave must not push it back to draft.
    if (
      requestedStatus === 'draft' &&
      existingRelease?.status &&
      ['pending_review', 'approved', 'published'].includes(existingRelease.status)
    ) {
      finalStatus = existingRelease.status as 'pending_review' | 'approved' | 'published'
    }

    const releaseData: Record<string, unknown> = {
      user_id: user.id,
      updated_at: new Date().toISOString()
    }

    // Map all fields
    const assignIfDefined = (key: string, value: unknown) => {
      if (value !== undefined) {
        releaseData[key] = value
      }
    }

    assignIfDefined('upc', upc)
    assignIfDefined('upc_confirmed', upc_confirmed)
    assignIfDefined('ean', ean)
    assignIfDefined('ean_confirmed', ean_confirmed)
    assignIfDefined('release_title', release_title)
    assignIfDefined('release_title_confirmed', release_title_confirmed)
    assignIfDefined('release_title_source', release_title_source)
    assignIfDefined('release_type', release_type)
    assignIfDefined('track_count', track_count)
    assignIfDefined('track_count_label', track_count_label)
    assignIfDefined('release_version', release_version)
    assignIfDefined('apply_version_to_all', apply_version_to_all)
    assignIfDefined('country_of_origin', country_of_origin)
    assignIfDefined('available_home', available_home)
    assignIfDefined('available_specific', available_specific)
    assignIfDefined('available_worldwide', available_worldwide)
    assignIfDefined('specific_territories', specific_territories)
    assignIfDefined('territory_rights_confirmed', territory_rights_confirmed)
    assignIfDefined('go_live_option', go_live_option)
    assignIfDefined('go_live_date', go_live_date)
    assignIfDefined('master_rights_type', master_rights_type)
    assignIfDefined('record_labels', record_labels)
    assignIfDefined('master_rights_confirmed', master_rights_confirmed)
    assignIfDefined('publishing_rights_type', publishing_rights_type)
    assignIfDefined('publishers', publishers)
    assignIfDefined('apply_publisher_to_all_tracks', apply_publisher_to_all_tracks)
    assignIfDefined('publishing_rights_confirmed', publishing_rights_confirmed)
    assignIfDefined('distributor_name', distributor_name)
    assignIfDefined('distributor_confirmed', distributor_confirmed)
    assignIfDefined('distributor_contact_name', distributor_contact_name)
    assignIfDefined('distributor_contact_email', distributor_contact_email)
    assignIfDefined('wrote_composition', wrote_composition)
    assignIfDefined('pro_name', pro_name)
    assignIfDefined('pro_confirmed', pro_confirmed)
    assignIfDefined('pro_contact_name', pro_contact_name)
    assignIfDefined('pro_contact_email', pro_contact_email)
    assignIfDefined('mcs_name', mcs_name)
    assignIfDefined('mcs_confirmed', mcs_confirmed)
    assignIfDefined('mcs_contact_name', mcs_contact_name)
    assignIfDefined('mcs_contact_email', mcs_contact_email)
    assignIfDefined('cover_artwork_url', cover_artwork_url)
    assignIfDefined('cover_caption', cover_caption)
    assignIfDefined('status', finalStatus) // Use finalStatus instead of status for hybrid approval
    assignIfDefined('current_step', current_step)
    assignIfDefined('upload_guide_confirmed', upload_guide_confirmed)
    assignIfDefined('agree_terms_of_use', agree_terms_of_use)
    assignIfDefined('agree_distribution_policy', agree_distribution_policy)
    assignIfDefined('agree_privacy_policy', agree_privacy_policy)
    assignIfDefined('confirm_details_true', confirm_details_true)
    assignIfDefined('confirm_legal_liability', confirm_legal_liability)
    assignIfDefined('confirm_no_other_artist_name', confirm_no_other_artist_name)
    assignIfDefined('signatory_role', signatory_role)
    assignIfDefined('signatory_first_name', signatory_first_name?.trim?.() ?? signatory_first_name)
    assignIfDefined('signatory_middle_names', signatory_middle_names?.trim?.() ?? signatory_middle_names)
    assignIfDefined('signatory_last_name', signatory_last_name?.trim?.() ?? signatory_last_name)
    assignIfDefined('signatory_email', signatory_email?.trim?.() ?? signatory_email)

    // Handle status transitions
    if (
      (finalStatus === 'pending_review' || finalStatus === 'published') &&
      !existingRelease?.submitted_at
    ) {
      releaseData.submitted_at = new Date().toISOString()
    }
    if (finalStatus === 'published' && !existingRelease?.published_at) {
      releaseData.published_at = new Date().toISOString()
    }

    let result
    if (id) {
      // Update existing release
      const { data, error } = await supabase
        .from('music_releases')
        .update(releaseData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('API: Error updating music release:', error)
        return NextResponse.json({
          error: 'Database error',
          details: error.message
        }, { status: 500 })
      }
      result = data
    } else {
      // Create new release
      releaseData.created_at = new Date().toISOString()
      if (!releaseData.release_title) {
        releaseData.release_title = 'Untitled Release'
      }

      const { data, error } = await supabase
        .from('music_releases')
        .insert(releaseData)
        .select()
        .single()

      if (error) {
        console.error('API: Error creating music release:', error)
        return NextResponse.json({
          error: 'Database error',
          details: error.message
        }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: id ? 'Release updated successfully' : 'Release created successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Delete a music release
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const releaseId = searchParams.get('id')

    if (!releaseId) {
      return NextResponse.json({ error: 'Release ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('music_releases')
      .delete()
      .eq('id', releaseId)
      .eq('user_id', user.id)

    if (error) {
      console.error('API: Error deleting music release:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Release deleted successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
