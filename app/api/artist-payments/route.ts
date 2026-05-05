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

const toEntityType = (value: unknown) => {
  if (
    value === 'Incorporated Company' ||
    value === 'Incorporated Partnership' ||
    value === 'Sole Trader' ||
    value === 'Partnership'
  ) {
    return value
  }
  return null
}

const getRecordString = (record: unknown, key: string, fallback = '') => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return fallback
  const value = (record as Record<string, unknown>)[key]
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback
}

const getRecordBoolean = (record: unknown, key: string, fallback = false) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return fallback
  const value = (record as Record<string, unknown>)[key]
  return typeof value === 'boolean' ? value : fallback
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

    const { data: artistProfile } = await supabase
      .from('user_profiles')
      .select('id, stage_name, artist_entity_isni, artist_primary_roles, location_details, contact_details, performer_isni, creator_ipi_cae, created_at')
      .eq('id', profileId)
      .maybeSingle()

    const { data: legalMembers } = await supabase
      .from('artist_members_active')
      .select('id, invitation_id, name, email, roles, metadata, joined_at')
      .eq('artist_profile_id', profileId)
      .order('joined_at', { ascending: true })

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

    const locationDetails = artistProfile?.location_details
    const contactDetails = artistProfile?.contact_details
    const ownerFirstName = getRecordString(locationDetails, 'artist_owner_first_name', (user.user_metadata?.first_name as string | undefined) ?? '')
    const ownerLastName = getRecordString(locationDetails, 'artist_owner_last_name', (user.user_metadata?.last_name as string | undefined) ?? '')
    const ownerNickname = getRecordString(locationDetails, 'artist_owner_nickname')
    const ownerEmail = getRecordString(locationDetails, 'artist_owner_email', user.email || getRecordString(contactDetails, 'email'))

    const ownerLegalMember = {
      id: `${profileId}-profile-owner`,
      invitation_id: null,
      name: [ownerFirstName, ownerNickname ? `"${ownerNickname}"` : '', ownerLastName].filter(Boolean).join(' ').trim() || artistProfile?.stage_name || user.email || 'Profile Owner',
      email: ownerEmail,
      roles: Array.isArray(artistProfile?.artist_primary_roles) ? artistProfile.artist_primary_roles : [],
      metadata: {
        firstName: ownerFirstName,
        lastName: ownerLastName,
        nickname: ownerNickname,
        memberType: 'performer',
        performerIsni: artistProfile?.performer_isni || '',
        performerIpn: getRecordString(locationDetails, 'artist_owner_performer_ipn'),
        creatorIpiCae: artistProfile?.creator_ipi_cae || '',
        isShareholder: getRecordBoolean(locationDetails, 'artist_owner_is_shareholder', false),
        isMainContact: getRecordBoolean(locationDetails, 'artist_owner_is_main_contact', false),
        memberSince: getRecordString(locationDetails, 'artist_owner_member_since'),
        isCurrentMember: true,
        dateLeft: '',
        isAdmin: true
      },
      joined_at: artistProfile?.created_at ?? null
    }

    return NextResponse.json({
      data: paymentData || null,
      artistProfile: artistProfile || null,
      legalMembers: [ownerLegalMember, ...(legalMembers || [])]
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
      official_ids_acknowledged: !!body.official_ids_acknowledged,
      payment_flows_acknowledged: !!body.payment_flows_acknowledged,
      entity_type: toEntityType(body.entity_type),
      artist_entity_legal_name: toNullableString(body.artist_entity_legal_name),
      main_contact_first_name: toNullableString(body.main_contact_first_name),
      main_contact_last_name: toNullableString(body.main_contact_last_name),
      main_contact_phone_country_code: toNullableString(body.main_contact_phone_country_code),
      main_contact_phone: toNullableString(body.main_contact_phone),
      main_contact_email: toNullableString(body.main_contact_email),
      country_of_incorporation: toNullableString(body.country_of_incorporation),
      country_of_tax_residence: toNullableString(body.country_of_tax_residence),
      generic_tax_id: toNullableString(body.generic_tax_id),
      individual_tax_id: toNullableString(body.individual_tax_id),
      business_tax_id: toNullableString(body.business_tax_id),
      vat_gst_sst_id: toNullableString(body.vat_gst_sst_id),
      company_registration_number: toNullableString(body.company_registration_number),
      company_formation_date: toNullableString(body.company_formation_date),
      legal_entity_date_of_birth: toNullableString(body.legal_entity_date_of_birth),
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
