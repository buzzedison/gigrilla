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

// POST - Submit an error report
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      releaseId,
      field,
      description,
      expectedValue,
      currentValue
    } = body

    // Validate required fields
    if (!releaseId || !field || !description || !expectedValue) {
      return NextResponse.json(
        { error: 'Missing required fields: releaseId, field, description, expectedValue' },
        { status: 400 }
      )
    }

    // Verify the release belongs to the user or get release info
    const { data: release, error: releaseError } = await supabase
      .from('music_releases')
      .select('id, release_title, upc, ean')
      .eq('id', releaseId)
      .eq('user_id', user.id)
      .single()

    if (releaseError || !release) {
      return NextResponse.json(
        { error: 'Release not found or unauthorized' },
        { status: 404 }
      )
    }

    // Create error report (store in a simple log table or send notification)
    // For now, we'll just log it and could optionally store in a table
    const errorReport = {
      release_id: releaseId,
      user_id: user.id,
      field,
      description,
      expected_value: expectedValue,
      current_value: currentValue,
      release_title: release.release_title,
      upc: release.upc,
      ean: release.ean,
      user_email: user.email,
      reported_at: new Date().toISOString()
    }

    console.log('🚨 Music Release Error Report:', errorReport)

    // TODO: Optionally store in a dedicated error_reports table
    // TODO: Send notification to admin/support team
    // TODO: Create ticket in support system

    // For production, you might want to:
    // 1. Store in a database table for tracking
    // 2. Send email to support team
    // 3. Create a Slack notification
    // 4. Log to error tracking service (Sentry, etc.)

    return NextResponse.json({
      success: true,
      message: 'Error report submitted successfully. Our team will review it shortly.',
      data: {
        reported_at: errorReport.reported_at
      }
    })

  } catch (error) {
    console.error('Error report API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
