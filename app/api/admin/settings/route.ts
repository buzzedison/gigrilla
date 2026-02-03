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

// GET - Fetch platform settings
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminCheck = await isAdmin(supabase, user.id)
    if (!adminCheck) {
      return NextResponse.json({
        error: 'Insufficient permissions. Admin role required.'
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const settingKey = searchParams.get('key')

    if (settingKey) {
      // Fetch specific setting
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('setting_key', settingKey)
        .single()

      if (error) {
        return NextResponse.json({
          error: 'Setting not found',
          details: error.message
        }, { status: 404 })
      }

      return NextResponse.json({ success: true, data })
    }

    // Fetch all settings and parse them into a usable format
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .order('setting_key', { ascending: true })

    if (error) {
      console.error('API: Error fetching settings:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    // Parse settings into a structured object
    const settings: Record<string, any> = {
      approval_mode: { mode: 'auto', beta_phase: true },
      automated_verification_enabled: false,
      moderation_settings: { auto_flag_explicit: false, require_isrc: false, require_iswc: false }
    }

    if (data) {
      data.forEach((setting: any) => {
        settings[setting.setting_key] = setting.setting_value
      })
    }

    return NextResponse.json({ success: true, settings })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update a specific platform setting
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminCheck = await isAdmin(supabase, user.id)
    if (!adminCheck) {
      return NextResponse.json({
        error: 'Insufficient permissions. Admin role required.'
      }, { status: 403 })
    }

    const body = await request.json()
    const { setting_key, setting_value, description } = body

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json({
        error: 'Setting key and value are required'
      }, { status: 400 })
    }

    // Validate approval mode if being updated
    if (setting_key === 'approval_mode') {
      const mode = setting_value?.mode
      if (!mode || !['auto', 'manual'].includes(mode)) {
        return NextResponse.json({
          error: 'Invalid approval mode. Must be "auto" or "manual"'
        }, { status: 400 })
      }
    }

    const updateData: Record<string, any> = {
      setting_key: setting_key,
      setting_value: setting_value,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    if (description) {
      updateData.description = description
    }

    // Update or insert setting
    const { data, error } = await supabase
      .from('platform_settings')
      .upsert(updateData, { onConflict: 'setting_key' })
      .select()
      .single()

    if (error) {
      console.error('API: Error updating setting:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Setting updated successfully',
      data
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Update platform settings
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminCheck = await isAdmin(supabase, user.id)
    if (!adminCheck) {
      return NextResponse.json({
        error: 'Insufficient permissions. Admin role required.'
      }, { status: 403 })
    }

    const body = await request.json()
    const { settingKey, settingValue, description } = body

    if (!settingKey || settingValue === undefined) {
      return NextResponse.json({
        error: 'Setting key and value are required'
      }, { status: 400 })
    }

    // Validate approval mode if being updated
    if (settingKey === 'approval_mode') {
      const mode = settingValue?.mode
      if (!mode || !['auto', 'manual'].includes(mode)) {
        return NextResponse.json({
          error: 'Invalid approval mode. Must be "auto" or "manual"'
        }, { status: 400 })
      }
    }

    const updateData: Record<string, any> = {
      setting_value: settingValue,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    }

    if (description) {
      updateData.description = description
    }

    // Update or insert setting
    const { data, error } = await supabase
      .from('platform_settings')
      .upsert({
        setting_key: settingKey,
        ...updateData
      })
      .select()
      .single()

    if (error) {
      console.error('API: Error updating setting:', error)
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Setting updated successfully',
      data
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
