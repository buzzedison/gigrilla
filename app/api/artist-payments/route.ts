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

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get artist profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('profile_type', 'artist')
      .single()

    if (profileError || !profile) {
      return NextResponse.json({
        data: null,
        message: 'No artist profile found'
      })
    }

    const { data: paymentData, error: paymentError } = await supabase
      .from('artist_payment_details')
      .select('*')
      .eq('artist_profile_id', profile.id)
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

    // Get artist profile ID for this user
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('profile_type', 'artist')
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 })
    }

    const body = await request.json()

    const updateData = {
      artist_profile_id: profile.id,
      use_fan_banking: body.use_fan_banking ?? false,
      payment_out_method: body.payment_out_method,
      payment_out_bank_name: body.payment_out_bank_name,
      payment_out_account_holder: body.payment_out_account_holder,
      payment_out_sort_code: body.payment_out_sort_code,
      payment_out_account_number: body.payment_out_account_number,
      payment_out_card_name: body.payment_out_card_name,
      payment_out_card_number: body.payment_out_card_number,
      payment_out_card_expiry: body.payment_out_card_expiry,
      payment_out_card_cvv: body.payment_out_card_cvv,
      payment_in_same_as_out: body.payment_in_same_as_out ?? true,
      payment_in_method: body.payment_in_method,
      payment_in_bank_name: body.payment_in_bank_name,
      payment_in_account_holder: body.payment_in_account_holder,
      payment_in_sort_code: body.payment_in_sort_code,
      payment_in_account_number: body.payment_in_account_number,
      payment_in_card_name: body.payment_in_card_name,
      payment_in_card_number: body.payment_in_card_number,
      payment_in_card_expiry: body.payment_in_card_expiry,
      payment_in_card_cvv: body.payment_in_card_cvv,
      updated_at: new Date().toISOString()
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('artist_payment_details')
      .select('id')
      .eq('artist_profile_id', profile.id)
      .maybeSingle()

    let result
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('artist_payment_details')
        .update(updateData)
        .eq('artist_profile_id', profile.id)
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
