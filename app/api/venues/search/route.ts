import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service-client'

function toTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function safeObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function formatAddress(value: unknown) {
  const address = safeObject(value)
  const line1 = toTrimmedString(address.line1)
  const city = toTrimmedString(address.city)
  const state = toTrimmedString(address.state)
  const country = toTrimmedString(address.country)
  const postalCode = toTrimmedString(address.postal_code || address.postcode || address.zip)
  const formatted = [line1, city, state, postalCode, country].filter(Boolean).join(', ')
  return {
    line1,
    city,
    state,
    country,
    postalCode,
    formatted,
  }
}

function formatContact(value: unknown) {
  const contact = safeObject(value)
  const name = toTrimmedString(contact.name || contact.contact_name)
  const email = toTrimmedString(contact.email || contact.contact_email)
  const phoneCode = toTrimmedString(contact.phone_code || contact.country_code)
  const phone = toTrimmedString(contact.phone || contact.phone_number)

  return {
    name,
    email,
    phoneCode,
    phone,
  }
}

async function createSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
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
            // Ignore from Server Components
          }
        },
      },
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = toTrimmedString(searchParams.get('query'))
    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const limitParam = Number.parseInt(toTrimmedString(searchParams.get('limit')) || '8', 10)
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 8

    const serviceSupabase = createServiceClient()
    const { data, error } = await serviceSupabase
      .from('venues')
      .select('id, name, address, contact_details')
      .ilike('name', `%${query}%`)
      .limit(limit)

    if (error) {
      console.error('Venue search failed', error)
      return NextResponse.json({ error: 'Unable to search venues right now.' }, { status: 500 })
    }

    const suggestions = (data || []).map((row) => {
      const address = formatAddress((row as { address?: unknown }).address)
      const contact = formatContact((row as { contact_details?: unknown }).contact_details)
      return {
        id: toTrimmedString((row as { id?: unknown }).id),
        name: toTrimmedString((row as { name?: unknown }).name),
        address: address.formatted || '',
        city: address.city,
        state: address.state,
        country: address.country,
        postalCode: address.postalCode,
        contactName: contact.name,
        contactEmail: contact.email,
        contactPhoneCode: contact.phoneCode,
        contactPhone: contact.phone,
      }
    }).filter((row) => row.id && row.name)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Venue search unexpected error', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
