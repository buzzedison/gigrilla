import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 9) {
    return { valid: false, error: 'Password must be at least 9 characters long' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one capital letter' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' }
  }
  
  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, memberType } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || request.nextUrl.origin
    // Redirect to signup page with onboarding param to continue the flow after email verification
    const onboardingType = memberType || 'fan'
    const onboardingRedirect = `${siteUrl}/signup?onboarding=${onboardingType}`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          user_role: 'fan',
          account_type: 'guest',
          onboarding_member_type: memberType || 'fan',
          onboarding_completed: false
        },
        emailRedirectTo: onboardingRedirect
      }
    })

    if (error) {
      console.error('Signup API: Auth error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.log('Signup API: User signed up successfully:', data.user?.id)

    // Check if email verification is needed
    const needsEmailVerification = !data.session && data.user && !data.user.email_confirmed_at

    return NextResponse.json({
      user: data.user,
      session: data.session,
      needsEmailVerification,
      message: needsEmailVerification 
        ? 'Please check your email to verify your account' 
        : 'Signup successful'
    })

  } catch (error) {
    console.error('Signup API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
