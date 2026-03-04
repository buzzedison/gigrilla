import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const toNullableString = (value: unknown) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const toPaymentMethod = (value: unknown): 'direct_debit' | 'card' | null => {
  if (value === 'direct_debit' || value === 'card') return value
  return null
}

async function ensureUserRecord(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }
) {
  const { error: userCheckError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  if (userCheckError && userCheckError.code === 'PGRST116') {
    const { error: userCreateError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        first_name: (user.user_metadata?.first_name as string) || '',
        last_name: (user.user_metadata?.last_name as string) || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (userCreateError) {
      return { error: userCreateError }
    }
  } else if (userCheckError) {
    return { error: userCheckError }
  }

  return { error: null }
}

async function getOrCreateArtistProfileId(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
) {
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', userId)
    .eq('profile_type', 'artist')
    .maybeSingle()

  if (!existingProfileError && existingProfile?.id) {
    return { profileId: existingProfile.id as string, error: null }
  }

  if (existingProfileError && existingProfileError.code !== 'PGRST116') {
    return { profileId: null, error: existingProfileError }
  }

  const { data: createdProfile, error: createProfileError } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      profile_type: 'artist',
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,profile_type'
    })
    .select('id')
    .single()

  if (createProfileError) {
    return { profileId: null, error: createProfileError }
  }

  return { profileId: (createdProfile?.id as string) ?? null, error: null }
}

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

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { profileId, error: profileError } = await getOrCreateArtistProfileId(supabase, user.id)

    if (profileError || !profileId) {
      return NextResponse.json({
        data: null,
        message: 'No artist profile found'
      })
    }

    const { data: paymentData, error: paymentError } = await supabase
      .from('artist_payment_details')
      .select('*')
      .eq('artist_profile_id', profileId)
      .maybeSingle()

    if (paymentError && paymentError.code !== 'PGRST116') {
      console.error('API: Database error:', paymentError)
      return NextResponse.json({
        error: 'Database error',
        details: paymentError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      data: paymentData || null
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

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error: ensureUserError } = await ensureUserRecord(supabase, {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata as Record<string, unknown> | undefined
    })

    if (ensureUserError) {
      console.error('API: Failed to ensure user record:', ensureUserError)
      return NextResponse.json({
        error: 'Failed to prepare user record',
        details: ensureUserError.message
      }, { status: 500 })
    }

    const { profileId, error: profileError } = await getOrCreateArtistProfileId(supabase, user.id)
    if (profileError || !profileId) {
      console.error('API: Failed to get/create artist profile:', profileError)
      return NextResponse.json({
        error: 'Artist profile not found',
        details: profileError?.message ?? 'Unable to create artist profile'
      }, { status: 404 })
    }

    const body = await request.json()
    const useFanBanking = !!body.use_fan_banking
    const paymentOutMethod = useFanBanking ? null : (toPaymentMethod(body.payment_out_method) ?? 'direct_debit')
    const paymentInSameAsOut = body.payment_in_same_as_out ?? true
    const paymentInMethod = useFanBanking
      ? null
      : paymentInSameAsOut
        ? paymentOutMethod
        : (toPaymentMethod(body.payment_in_method) ?? 'direct_debit')

    const updateData = {
      artist_profile_id: profileId,
      use_fan_banking: useFanBanking,
      payment_out_method: paymentOutMethod,
      payment_out_bank_name: toNullableString(body.payment_out_bank_name),
      payment_out_account_holder: toNullableString(body.payment_out_account_holder),
      payment_out_sort_code: toNullableString(body.payment_out_sort_code),
      payment_out_account_number: toNullableString(body.payment_out_account_number),
      payment_out_card_name: toNullableString(body.payment_out_card_name),
      payment_out_card_number: toNullableString(body.payment_out_card_number),
      payment_out_card_expiry: toNullableString(body.payment_out_card_expiry),
      payment_out_card_cvv: toNullableString(body.payment_out_card_cvv),
      payment_in_same_as_out: paymentInSameAsOut,
      payment_in_method: paymentInMethod,
      payment_in_bank_name: toNullableString(body.payment_in_bank_name),
      payment_in_account_holder: toNullableString(body.payment_in_account_holder),
      payment_in_sort_code: toNullableString(body.payment_in_sort_code),
      payment_in_account_number: toNullableString(body.payment_in_account_number),
      payment_in_card_name: toNullableString(body.payment_in_card_name),
      payment_in_card_number: toNullableString(body.payment_in_card_number),
      payment_in_card_expiry: toNullableString(body.payment_in_card_expiry),
      payment_in_card_cvv: toNullableString(body.payment_in_card_cvv),
      updated_at: new Date().toISOString()
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('artist_payment_details')
      .select('id')
      .eq('artist_profile_id', profileId)
      .maybeSingle()

    let result
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('artist_payment_details')
        .update(updateData)
        .eq('artist_profile_id', profileId)
        .select()
        .single()

      if (error) {
        console.error('API: Database error:', error)
        return NextResponse.json({
          error: 'Failed to update payment details',
          details: error.message
        }, { status: 500 })
      }
      result = data
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from('artist_payment_details')
        .insert({
          ...updateData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('API: Database error:', error)
        return NextResponse.json({
          error: 'Failed to save payment details',
          details: error.message
        }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({
      data: result,
      message: 'Payment details saved successfully'
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
