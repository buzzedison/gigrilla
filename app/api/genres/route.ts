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

    console.log('API: Fetching genres')

    const { data: genresData, error: genresError } = await supabase
      .from('genres')
      .select('id, name')
      .order('name')

    if (genresError) {
      console.error('API: Database error:', genresError)
      return NextResponse.json({
        error: 'Database error',
        details: genresError.message,
        code: genresError.code
      }, { status: 500 })
    }

    console.log('API: Successfully fetched genres data:', genresData?.length)

    return NextResponse.json({
      data: genresData || []
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
