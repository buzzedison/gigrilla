import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get artist profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('account_type', 'artist')
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ data: [], count: 0 })
    }

    const { data: videos, error: videosError } = await supabase
      .from('artist_videos')
      .select('*')
      .eq('artist_profile_id', profile.id)
      .order('sort_order', { ascending: true })

    if (videosError) {
      console.error('API: Database error:', videosError)
      return NextResponse.json({
        error: 'Database error',
        details: videosError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      data: videos || [],
      count: videos?.length || 0
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get artist profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('account_type', 'artist')
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, video_url, thumbnail_url } = body

    if (!title || !video_url) {
      return NextResponse.json({ error: 'Title and video URL are required' }, { status: 400 })
    }

    // Validate YouTube URL
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/
    if (!youtubeRegex.test(video_url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    // Get current max sort_order
    const { data: existingVideos } = await supabase
      .from('artist_videos')
      .select('sort_order')
      .eq('artist_profile_id', profile.id)
      .order('sort_order', { ascending: false })
      .limit(1)

    const nextSortOrder = existingVideos && existingVideos.length > 0 
      ? (existingVideos[0].sort_order || 0) + 1 
      : 0

    const { data: videoData, error: dbError } = await supabase
      .from('artist_videos')
      .insert({
        artist_profile_id: profile.id,
        title,
        video_url,
        thumbnail_url: thumbnail_url || null,
        video_type: 'youtube',
        sort_order: nextSortOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('API: Database error:', dbError)
      return NextResponse.json({
        error: 'Failed to save video',
        details: dbError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      data: videoData,
      message: 'Video added successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get artist profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('account_type', 'artist')
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { id, title, is_featured } = body

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (is_featured !== undefined) updateData.is_featured = is_featured

    const { data: videoData, error: dbError } = await supabase
      .from('artist_videos')
      .update(updateData)
      .eq('id', id)
      .eq('artist_profile_id', profile.id)
      .select()
      .single()

    if (dbError) {
      console.error('API: Database error:', dbError)
      return NextResponse.json({
        error: 'Failed to update video',
        details: dbError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      data: videoData,
      message: 'Video updated successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get artist profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('account_type', 'artist')
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const { error: dbError } = await supabase
      .from('artist_videos')
      .delete()
      .eq('id', id)
      .eq('artist_profile_id', profile.id)

    if (dbError) {
      console.error('API: Database error:', dbError)
      return NextResponse.json({
        error: 'Failed to delete video',
        details: dbError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Video deleted successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
