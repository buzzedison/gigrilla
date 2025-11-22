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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('API: Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized', details: authError.message }, { status: 401 })
    }

    if (!user) {
      console.error('API: No authenticated user')
      return NextResponse.json({ error: 'No user authenticated' }, { status: 401 })
    }

    console.log('API: Fetching artist photos for user:', user.id)

    const { data: photos, error: photosError } = await supabase
      .from('artist_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (photosError) {
      console.error('API: Database error:', photosError)
      return NextResponse.json({
        error: 'Database error',
        details: photosError.message,
        code: photosError.code
      }, { status: 500 })
    }

    console.log('API: Successfully fetched artist photos:', photos?.length || 0)

    return NextResponse.json({
      data: photos || [],
      count: photos?.length || 0
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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('API: Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized', details: authError.message }, { status: 401 })
    }

    if (!user) {
      console.error('API: No authenticated user')
      return NextResponse.json({ error: 'No user authenticated' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const caption = formData.get('caption') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!type || !['logo', 'header', 'photo'].includes(type)) {
      return NextResponse.json({ error: 'Invalid photo type' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only .jpg, .png, and .webp are allowed' }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    console.log('API: Uploading photo for user:', user.id, 'type:', type)

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${type}/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('artist-photos')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('API: Upload error:', uploadError)
      return NextResponse.json({
        error: 'Failed to upload file',
        details: uploadError.message
      }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('artist-photos')
      .getPublicUrl(fileName)

    // For logo and header, delete existing photos of same type
    if (type === 'logo' || type === 'header') {
      await supabase
        .from('artist_photos')
        .delete()
        .eq('user_id', user.id)
        .eq('type', type)
    }

    // Save photo metadata to database
    const { data: photoData, error: dbError } = await supabase
      .from('artist_photos')
      .insert({
        user_id: user.id,
        url: publicUrl,
        caption: caption || '',
        type: type,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('API: Database error:', dbError)
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('artist-photos')
        .remove([fileName])
      
      return NextResponse.json({
        error: 'Failed to save photo metadata',
        details: dbError.message
      }, { status: 500 })
    }

    console.log('API: Successfully uploaded photo:', photoData.id)

    return NextResponse.json({
      data: photoData,
      message: 'Photo uploaded successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
