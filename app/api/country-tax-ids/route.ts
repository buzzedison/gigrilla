import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * GET /api/country-tax-ids
 *
 * Query params (mutually exclusive, in priority order):
 *   ?code=GB          → look up by ISO 2-letter country code
 *   ?name=Nigeria     → look up by country name (case-insensitive)
 *   ?all=1            → return all 249 countries (lightweight — names+codes+authority only)
 *
 * Returns a `CountryTaxIdRow` or `CountryTaxIdRow[]`.
 */

export interface CountryTaxIdRow {
  country_name: string
  country_code: string
  tax_authority: string | null
  is_unverifiable: boolean

  generic_id_corp_display: boolean
  generic_id_indiv_display: boolean
  generic_id_name: string | null
  generic_id_format: string | null

  individual_id_corp_display: boolean
  individual_id_indiv_display: boolean
  individual_id_name: string | null
  individual_id_format: string | null

  business_id_corp_display: boolean
  business_id_indiv_display: boolean
  business_id_name: string | null
  business_id_format: string | null

  partnership_id_corp_display: boolean
  partnership_id_indiv_display: boolean
  partnership_id_name: string | null
  partnership_id_format: string | null

  vat_id_corp_display: boolean
  vat_id_indiv_display: boolean
  vat_id_name: string | null
  vat_id_format: string | null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')?.trim().toUpperCase()
  const name = searchParams.get('name')?.trim()
  const all = searchParams.get('all')

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // Return stripped list of all countries (for dropdowns)
  if (all === '1') {
    const { data, error } = await supabase
      .from('country_tax_ids')
      .select('country_name, country_code, tax_authority, is_unverifiable')
      .order('country_name', { ascending: true })

    if (error) {
      console.error('country-tax-ids GET all error:', error)
      return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
    }

    return NextResponse.json({ data })
  }

  // Look up by code
  if (code) {
    const { data, error } = await supabase
      .from('country_tax_ids')
      .select('*')
      .eq('country_code', code)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: `No tax ID data found for country code: ${code}` }, { status: 404 })
      }
      console.error('country-tax-ids GET by code error:', error)
      return NextResponse.json({ error: 'Failed to fetch tax ID data' }, { status: 500 })
    }

    return NextResponse.json({ data })
  }

  // Look up by name (case-insensitive)
  if (name) {
    const { data, error } = await supabase
      .from('country_tax_ids')
      .select('*')
      .ilike('country_name', name)
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: `No tax ID data found for: ${name}` }, { status: 404 })
      }
      console.error('country-tax-ids GET by name error:', error)
      return NextResponse.json({ error: 'Failed to fetch tax ID data' }, { status: 500 })
    }

    return NextResponse.json({ data })
  }

  return NextResponse.json(
    { error: 'Provide ?code=XX, ?name=CountryName, or ?all=1' },
    { status: 400 }
  )
}
