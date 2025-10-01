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

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Session API: Error getting session:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!session) {
      return NextResponse.json(
        { 
          user: null, 
          session: null,
          authenticated: false 
        }
      )
    }

    console.log('Session API: Session found for user:', session.user.id)

    return NextResponse.json({
      user: session.user,
      session: session,
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
