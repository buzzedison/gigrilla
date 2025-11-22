import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: photoId } = await params
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

    const body = await request.json()
    const { caption } = body

    console.log('API: Updating photo caption for photo:', photoId, 'user:', user.id)

    // First verify the photo belongs to the user
    const { data: existingPhoto, error: fetchError } = await supabase
      .from('artist_photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPhoto) {
      console.error('API: Photo not found or access denied:', fetchError)
      return NextResponse.json({ error: 'Photo not found or access denied' }, { status: 404 })
    }

    // Update the photo caption
    const { data: updatedPhoto, error: updateError } = await supabase
      .from('artist_photos')
      .update({
        caption: caption || '',
        updated_at: new Date().toISOString()
      })
      .eq('id', photoId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('API: Update error:', updateError)
      return NextResponse.json({
        error: 'Failed to update photo',
        details: updateError.message
      }, { status: 500 })
    }

    console.log('API: Successfully updated photo caption:', photoId)

    return NextResponse.json({
      data: updatedPhoto,
      message: 'Photo updated successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: photoId } = await params
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

    console.log('API: Deleting photo:', photoId, 'user:', user.id)

    // First verify the photo belongs to the user and get its info
    const { data: existingPhoto, error: fetchError } = await supabase
      .from('artist_photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingPhoto) {
      console.error('API: Photo not found or access denied:', fetchError)
      return NextResponse.json({ error: 'Photo not found or access denied' }, { status: 404 })
    }

    // Delete the photo from database
    const { error: deleteError } = await supabase
      .from('artist_photos')
      .delete()
      .eq('id', photoId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('API: Delete error:', deleteError)
      return NextResponse.json({
        error: 'Failed to delete photo',
        details: deleteError.message
      }, { status: 500 })
    }

    // Delete the file from storage
    if (existingPhoto.url) {
      try {
        // Extract file path from URL
        const urlParts = existingPhoto.url.split('/')
        const fileName = urlParts.slice(-2).join('/') // Get user_id/type/filename
        
        const { error: storageError } = await supabase.storage
          .from('artist-photos')
          .remove([fileName])

        if (storageError) {
          console.error('API: Storage delete error:', storageError)
          // Don't fail the request if storage delete fails, just log it
        }
      } catch (storageError) {
        console.error('API: Error parsing URL for storage delete:', storageError)
      }
    }

    console.log('API: Successfully deleted photo:', photoId)

    return NextResponse.json({
      message: 'Photo deleted successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
