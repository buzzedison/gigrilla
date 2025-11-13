import fs from 'node:fs'
import path from 'node:path'

type ParsedSubGenre = {
  id: string
  name: string
}

type ParsedMainGenre = {
  id: string
  name: string
  familyId: string
  subGenres: ParsedSubGenre[]
}

type ParsedFamily = {
  id: string
  name: string
  mainGenres: ParsedMainGenre[]
}

const FAMILY_NAMES = [
  'African Music',
  'Asian Pop Music',
  'Classical Music',
  'Country Music',
  'Dance & EDM Music',
  'Downtempo & Ambient Music',
  'Experimental & Avant-Garde Music',
  'Folk & Roots Music',
  'Hip-Hop & Rap Music',
  'Industrial & Gothic Music',
  'Latin Music',
  'Metal & Punk Music',
  'Pop Music',
  'Reggae & Dancehall Music',
  'Religious & Spiritual Music',
  'Rhythm & Blues (RnB/R&B) Music',
  'Rock Music',
  'Soundtrack, Film, TV & Stage Music',
  'South American Music',
  'The Blues & Jazz Music',
  'World (Other Traditional) Music'
] as const

const familyNameSet = new Set(FAMILY_NAMES.map((name) => name.toLowerCase()))
const MAIN_GENRE_HEADER = /^(.+?) > Main Genres?$/i
const SUB_GENRE_HEADER = /^(.+?) > Sub-Genres$/gm
const TAXONOMY_END_MARKER = 'Your Payment Details:'

const MAIN_GENRE_FAMILY_OVERRIDES: Record<string, string> = {
  'c-pop (mandarin) / mando-pop': 'Asian Pop Music',
  'south american pop': 'South American Music'
}

const SKIP_LINE_PATTERNS = [
  /^choose /i,
  /^dev note/i,
  /^your favourite/i,
  /^step /i,
  /^ctas?/i,
  /^ts&cs/i,
  /^fan profile/i,
  /^confirm membership/i,
  /^gigrilla/i,
  /^100%/i,
  /^\[\[/,
  /^\[/,
  /^-/,
  /^_/,
  /^#/,
  /^ℹ️/i,
  /^with full/i,
  /^pay-as-you-play/i,
  /^your payment/i
]

const STOP_SECTION_PATTERNS = [
  /^your payment/i,
  /^ts&cs/i,
  /^step /i,
  /^fan profile/i,
  /^confirm membership/i,
  /^3️⃣/,
  /^venue description/i,
  /^track genres/i
]

const filePath = path.join(process.cwd(), 'newplatform.md')
const rawContent = fs.readFileSync(filePath, 'utf-8')
const normalizedContent = normalizeQuotes(rawContent)

const taxonomyEndIndex = normalizedContent.indexOf(TAXONOMY_END_MARKER)
const taxonomyContent = taxonomyEndIndex === -1
  ? normalizedContent
  : normalizedContent.slice(0, taxonomyEndIndex)

const lines = taxonomyContent.split(/\r?\n/)

const familiesByName = new Map<string, ParsedFamily>()
const mainGenresByName = new Map<string, ParsedMainGenre>()

const usedFamilyIds = new Set<string>()
const usedTypeIds = new Set<string>()
const usedSubIds = new Set<string>()

function createSlug(input: string): string {
  const normalized = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  return normalized || 'slug'
}

function ensureUniqueId(base: string, registry: Set<string>): string {
  if (!registry.has(base)) {
    registry.add(base)
    return base
  }
  let counter = 2
  let candidate = `${base}-${counter}`
  while (registry.has(candidate)) {
    counter += 1
    candidate = `${base}-${counter}`
  }
  registry.add(candidate)
  return candidate
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function normalizeQuotes(value: string): string {
  return value
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2013|\u2014/g, '-')
}

function cleanLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function shouldSkipLine(line: string): boolean {
  return SKIP_LINE_PATTERNS.some((pattern) => pattern.test(line))
}

function shouldStopSection(line: string): boolean {
  return STOP_SECTION_PATTERNS.some((pattern) => pattern.test(line))
}

function escapeSql(value: string): string {
  return value.replace(/'/g, "''")
}

function ensureFamily(name: string): ParsedFamily {
  const key = normalizeKey(name)
  const existing = familiesByName.get(key)
  if (existing) return existing

  const familyId = ensureUniqueId(createSlug(name), usedFamilyIds)
  const family: ParsedFamily = {
    id: familyId,
    name,
    mainGenres: []
  }
  familiesByName.set(key, family)
  return family
}

function ensureMainGenre(family: ParsedFamily, name: string): ParsedMainGenre {
  const key = normalizeKey(name)
  const existing = mainGenresByName.get(key)
  if (existing) {
    if (existing.familyId !== family.id) {
      throw new Error(
        `[parse-genres] Main genre "${name}" is assigned to multiple families (${existing.familyId} vs ${family.id}). Please resolve the duplicate in newplatform.md.`
      )
    }
    return existing
  }

  const typeId = ensureUniqueId(createSlug(name), usedTypeIds)
  const mainGenre: ParsedMainGenre = {
    id: typeId,
    name,
    familyId: family.id,
    subGenres: []
  }
  family.mainGenres.push(mainGenre)
  mainGenresByName.set(key, mainGenre)
  return mainGenre
}

// Phase 1: collect families and main genres
let activeFamily: ParsedFamily | null = null
for (const rawLine of lines) {
  const trimmed = cleanLine(rawLine)
  if (!trimmed) continue

  if (trimmed.includes('Your Favourite Sub-Genres')) {
    activeFamily = null
    break
  }

  const familyMatch = trimmed.match(MAIN_GENRE_HEADER)
  if (familyMatch) {
    const familyName = familyMatch[1].trim()
    if (familyNameSet.has(familyName.toLowerCase())) {
      activeFamily = ensureFamily(familyName)
    } else {
      activeFamily = null
    }
    continue
  }

  if (!activeFamily) continue
  if (trimmed.includes('>')) continue
  if (trimmed.toLowerCase().includes('main genre')) continue
  if (trimmed.toLowerCase().includes('sub-genre')) continue
  if (trimmed.startsWith('[')) continue

  ensureMainGenre(activeFamily, trimmed)
}

// Phase 2: collect sub-genres
const subGenreSections: Array<{ name: string; start: number; headerStart: number }> = []
let match: RegExpExecArray | null
while ((match = SUB_GENRE_HEADER.exec(taxonomyContent)) !== null) {
  subGenreSections.push({
    name: cleanLine(match[1]),
    start: SUB_GENRE_HEADER.lastIndex,
    headerStart: match.index
  })
}

subGenreSections.forEach((section, index) => {
  const normalizedName = normalizeKey(section.name)
  let mainGenre = mainGenresByName.get(normalizedName)
  if (!mainGenre) {
    const overrideFamilyName = MAIN_GENRE_FAMILY_OVERRIDES[normalizedName]
    if (!overrideFamilyName) {
      console.warn(`[parse-genres] Missing main genre mapping for "${section.name}"`)
      return
    }
    const family = ensureFamily(overrideFamilyName)
    mainGenre = ensureMainGenre(family, section.name)
  }

  const end = index + 1 < subGenreSections.length
    ? subGenreSections[index + 1].headerStart
    : taxonomyContent.length

  const block = taxonomyContent
    .slice(section.start, end)
    .split(/\r?\n/)

  const seen = new Set<string>()

  for (const rawLine of block) {
    const trimmed = cleanLine(rawLine)
    if (!trimmed) continue

    if (trimmed.startsWith('(') && mainGenre.subGenres.length > 0) {
      const previous = mainGenre.subGenres[mainGenre.subGenres.length - 1]
      previous.name = `${previous.name} ${trimmed}`.trim()
      seen.add(previous.name.toLowerCase())
      continue
    }

    if (shouldStopSection(trimmed)) break
    if (shouldSkipLine(trimmed)) continue
    if (trimmed.includes('>')) break
    if (trimmed.toLowerCase().includes('sub-genre')) continue
    if (trimmed.toLowerCase().includes('main genre')) continue

    const normalized = trimmed.toLowerCase()
    if (seen.has(normalized)) continue
    seen.add(normalized)

    const subId = ensureUniqueId(
      `${mainGenre.id}-${createSlug(trimmed)}`,
      usedSubIds
    )
    mainGenre.subGenres.push({ id: subId, name: trimmed })
  }
})

const orderedFamilies: ParsedFamily[] = FAMILY_NAMES
  .map((name) => familiesByName.get(normalizeKey(name)))
  .filter((family): family is ParsedFamily => Boolean(family))

const totalMainGenres = orderedFamilies.reduce((sum, family) => sum + family.mainGenres.length, 0)
const totalSubGenres = orderedFamilies.reduce(
  (sum, family) => sum + family.mainGenres.reduce((inner, main) => inner + main.subGenres.length, 0),
  0
)

console.log(`[parse-genres] Families: ${orderedFamilies.length}`)
console.log(`[parse-genres] Main genres: ${totalMainGenres}`)
console.log(`[parse-genres] Sub-genres: ${totalSubGenres}`)

const migrationLines: string[] = [
  `-- 026_seed_complete_genre_taxonomy.sql`,
  `-- Complete genre taxonomy from newplatform.md`,
  `-- This migration replaces all existing genre data with the canonical structure`,
  ``,
  `BEGIN;`,
  ``,
  `-- Clear existing data (optional - comment out if you want to keep existing data)`,
  `-- TRUNCATE TABLE public.genre_subtypes CASCADE;`,
  `-- TRUNCATE TABLE public.genre_types CASCADE;`,
  `-- TRUNCATE TABLE public.genre_families CASCADE;`,
  ``
]

orderedFamilies.forEach((family) => {
  migrationLines.push(
    `INSERT INTO public.genre_families (id, name) VALUES ('${family.id}', '${escapeSql(family.name)}') ON CONFLICT (id) DO UPDATE SET name = excluded.name;`
  )
})

migrationLines.push('')

orderedFamilies.forEach((family) => {
  family.mainGenres.forEach((main) => {
    migrationLines.push(
      `INSERT INTO public.genre_types (id, family_id, name) VALUES ('${main.id}', '${family.id}', '${escapeSql(main.name)}') ON CONFLICT (id) DO UPDATE SET name = excluded.name, family_id = excluded.family_id;`
    )
  })
})

migrationLines.push('')

orderedFamilies.forEach((family) => {
  family.mainGenres.forEach((main) => {
    main.subGenres.forEach((sub) => {
      migrationLines.push(
        `INSERT INTO public.genre_subtypes (id, type_id, name) VALUES ('${sub.id}', '${main.id}', '${escapeSql(sub.name)}') ON CONFLICT (id) DO UPDATE SET name = excluded.name, type_id = excluded.type_id;`
      )
    })
  })
})

migrationLines.push('', 'COMMIT;', '')

const migrationPath = path.join(process.cwd(), 'database', 'migrations', '026_seed_complete_genre_taxonomy.sql')
fs.writeFileSync(migrationPath, migrationLines.join('\n'))

const taxonomyPath = path.join(process.cwd(), 'data', 'genre-taxonomy.json')
const taxonomyPayload = orderedFamilies.map((family) => ({
  id: family.id,
  name: family.name,
  mainGenres: family.mainGenres.map((main) => ({
    id: main.id,
    name: main.name,
    familyId: main.familyId,
    subGenres: main.subGenres
  }))
}))
fs.writeFileSync(taxonomyPath, JSON.stringify(taxonomyPayload, null, 2))

console.log(`[parse-genres] Wrote migration: ${migrationPath}`)
console.log(`[parse-genres] Wrote taxonomy JSON: ${taxonomyPath}`)
console.log(`[parse-genres] Families=${orderedFamilies.length} mainGenres=${totalMainGenres} subGenres=${totalSubGenres}`)
