import { NextResponse } from 'next/server'
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

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error('Session API: Error getting user:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { 
          user: null, 
          session: null,
          authenticated: false 
        }
      )
    }

    console.log('Session API: User authenticated:', user.id)

    return NextResponse.json({
      user: user,
      session: { user }, // Maintain backward compatibility
      authenticated: true
    })

  } catch (error) {
    console.error('Session API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
