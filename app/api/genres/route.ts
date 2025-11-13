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

    console.log('API: Fetching hierarchical genre taxonomy')

    // Fetch genre families
    const { data: familiesData, error: familiesError } = await supabase
      .from('genre_families')
      .select('id, name')
      .order('name')

    if (familiesError) {
      console.error('API: Error fetching genre families:', familiesError)
      return NextResponse.json({
        error: 'Database error',
        details: familiesError.message,
        code: familiesError.code
      }, { status: 500 })
    }

    // Fetch genre types (main genres)
    const { data: typesData, error: typesError } = await supabase
      .from('genre_types')
      .select('id, family_id, name')
      .order('name')

    if (typesError) {
      console.error('API: Error fetching genre types:', typesError)
      return NextResponse.json({
        error: 'Database error',
        details: typesError.message,
        code: typesError.code
      }, { status: 500 })
    }

    // Debug: Check if we got any types and specifically check African Music types
    const africanMusicTypes = typesData?.filter(t => t.family_id === 'african-music') || []
    console.log('API: Genre types fetched:', {
      totalTypes: typesData?.length || 0,
      africanMusicTypesCount: africanMusicTypes.length,
      africanMusicTypes: africanMusicTypes.map(t => ({ id: t.id, name: t.name, family_id: t.family_id })),
      sampleTypes: typesData?.slice(0, 5).map(t => ({ id: t.id, name: t.name, family_id: t.family_id }))
    })

    // Fetch genre subtypes (sub-genres)
    const { data: subtypesData, error: subtypesError } = await supabase
      .from('genre_subtypes')
      .select('id, type_id, name')
      .order('name')

    if (subtypesError) {
      console.error('API: Error fetching genre subtypes:', subtypesError)
      return NextResponse.json({
        error: 'Database error',
        details: subtypesError.message,
        code: subtypesError.code
      }, { status: 500 })
    }

    console.log('API: Subtypes fetched:', {
      totalSubtypes: subtypesData?.length || 0,
      newAgeSubtypes: subtypesData?.filter(s => s.type_id === 'new-age').length || 0,
      sampleSubtypes: subtypesData?.slice(0, 3).map(s => ({ id: s.id, name: s.name, type_id: s.type_id }))
    })

    // Organize into hierarchical structure
    const families = (familiesData || []).map(family => {
      const matchingTypes = (typesData || []).filter(type => type.family_id === family.id)
      
      // Debug for African Music
      if (family.id === 'african-music') {
        console.log(`API: Processing African Music family:`, {
          familyId: family.id,
          familyName: family.name,
          matchingTypesCount: matchingTypes.length,
          matchingTypes: matchingTypes.map(t => ({ id: t.id, name: t.name, family_id: t.family_id })),
          allTypesSample: typesData?.slice(0, 3).map(t => ({ id: t.id, name: t.name, family_id: t.family_id }))
        })
      }
      
      return {
        id: family.id,
        name: family.name,
        mainGenres: matchingTypes.map(type => ({
          id: type.id,
          name: type.name,
          familyId: type.family_id,
          subGenres: (subtypesData || [])
            .filter(subtype => subtype.type_id === type.id)
            .map(subtype => ({
              id: subtype.id,
              name: subtype.name,
              typeId: subtype.type_id
            }))
        }))
      }
    })

    // Debug: Check African Music family specifically
    const africanMusicFamily = families.find(f => f.id === 'african-music' || f.name.toLowerCase().includes('african'));
    console.log('API: Successfully fetched hierarchical genres:', {
      familiesCount: families.length,
      typesCount: typesData?.length || 0,
      subtypesCount: subtypesData?.length || 0,
      africanMusicFamily: africanMusicFamily ? {
        id: africanMusicFamily.id,
        name: africanMusicFamily.name,
        mainGenresCount: africanMusicFamily.mainGenres?.length || 0,
        mainGenres: africanMusicFamily.mainGenres?.map(m => m.name)
      } : 'Not found'
    })

    return NextResponse.json({
      data: {
        families,
        // Also provide flat arrays for backward compatibility
        allFamilies: familiesData || [],
        allTypes: typesData || [],
        allSubtypes: subtypesData || []
      }
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
