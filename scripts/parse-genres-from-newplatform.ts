import fs from 'fs'
import path from 'path'

// Helper function to create a slug from a name
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/['"]/g, '')
}

// Helper function to escape SQL strings
function escapeSql(str: string): string {
  return str.replace(/'/g, "''")
}

interface GenreFamily {
  name: string
  mainGenres: MainGenre[]
}

interface MainGenre {
  name: string
  subGenres: SubGenre[]
}

interface SubGenre {
  name: string
}

// Parse the newplatform.md file
const filePath = path.join(process.cwd(), 'newplatform.md')
const content = fs.readFileSync(filePath, 'utf-8')

const families: GenreFamily[] = []

// Extract Genre Families (lines 329-350)
const familyNames = [
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
]

// Also check for these patterns in the document
const alternativeFamilyPatterns = [
  { pattern: /Hip-Hop & Rap Music > Main Genre/i, name: 'Hip-Hop & Rap Music' },
  { pattern: /Industrial & Gothic Music > Main Genre/i, name: 'Industrial & Gothic Music' },
  { pattern: /Pop Music > Main Genre/i, name: 'Pop Music' }
]

// Parse Main Genres for each Family
const lines = content.split('\n')
let currentFamily: GenreFamily | null = null
let currentMainGenre: MainGenre | null = null
let inSubGenres = false
let collectingMainGenres = false

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim()
  
  // Check if this is a Genre Family header (e.g., "African Music > Main Genres" or "Pop Music > Main Genre")
  let foundFamily = false
  for (const familyName of familyNames) {
    if (line === `${familyName} > Main Genres` || line === `${familyName} > Main Genre`) {
      // Save previous family if exists
      if (currentFamily) {
        families.push(currentFamily)
      }
      currentFamily = {
        name: familyName,
        mainGenres: []
      }
      currentMainGenre = null
      inSubGenres = false
      collectingMainGenres = true
      foundFamily = true
      break
    }
  }
  
  // Also check alternative patterns
  if (!foundFamily) {
    for (const alt of alternativeFamilyPatterns) {
      if (alt.pattern.test(line)) {
        // Save previous family if exists
        if (currentFamily) {
          families.push(currentFamily)
        }
        currentFamily = {
          name: alt.name,
          mainGenres: []
        }
        currentMainGenre = null
        inSubGenres = false
        collectingMainGenres = true
        foundFamily = true
        break
      }
    }
  }
  
  // If we're collecting main genres for a family
  if (collectingMainGenres && currentFamily && line && !line.includes('>') && !line.includes('Main Genre') && !line.includes('Sub-Genre')) {
    // Check if next line starts a sub-genres section
    const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : ''
    if (nextLine.includes('> Sub-Genres')) {
      // This line is a main genre name, skip it - we'll catch it in the sub-genres section
      continue
    }
    
    // This is a main genre name (standalone, before sub-genres section)
    // Check if we already have this main genre
    const existingMainGenre = currentFamily.mainGenres.find(mg => mg.name === line)
    if (!existingMainGenre) {
      currentFamily.mainGenres.push({
        name: line,
        subGenres: []
      })
    }
  }
  
  // Check if this is a Main Genre header (format: "Main Genre Name > Sub-Genres")
  if (line.includes('> Sub-Genres') && currentFamily) {
    collectingMainGenres = false
    const mainGenreName = line.split('> Sub-Genres')[0].trim()
    
    // Find or create the main genre
    let mainGenre = currentFamily.mainGenres.find(mg => mg.name === mainGenreName)
    if (!mainGenre) {
      mainGenre = {
        name: mainGenreName,
        subGenres: []
      }
      currentFamily.mainGenres.push(mainGenre)
    }
    
    currentMainGenre = mainGenre
    inSubGenres = true
    continue
  }
  
  // Collect sub-genres
  if (inSubGenres && currentMainGenre && line && !line.startsWith('(') && !line.includes('>')) {
    // Skip empty lines and hybrid notes that are standalone
    if (line.length > 0 && !line.startsWith('Hybrid:')) {
      // Check if next line is a hybrid note
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : ''
      const hybridNote = nextLine.startsWith('(Hybrid:') ? nextLine : ''
      
      const subGenreName = hybridNote 
        ? `${line} ${hybridNote}`
        : line
      
      // Skip if it's a section header or empty
      if (subGenreName.length > 0 && 
          !subGenreName.includes('Sub-Genre') && 
          !subGenreName.includes('Main Genre') &&
          !subGenreName.includes('under each')) {
        currentMainGenre.subGenres.push({ name: subGenreName })
      }
    }
  }
  
  // Reset flags when we hit a new family section
  if (line.includes('> Main Genres') && line.includes('Genre Family')) {
    collectingMainGenres = true
    inSubGenres = false
    currentMainGenre = null
  }
}

// Save the last family
if (currentFamily) {
  families.push(currentFamily)
}

// Generate SQL
let sql = `-- 026_seed_complete_genre_taxonomy.sql
-- Complete genre taxonomy from newplatform.md
-- This migration replaces all existing genre data with the canonical structure

BEGIN;

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE public.genre_subtypes CASCADE;
-- TRUNCATE TABLE public.genre_types CASCADE;
-- TRUNCATE TABLE public.genre_families CASCADE;

`

// Insert Genre Families
for (const family of families) {
  const familyId = createSlug(family.name)
  const familyName = escapeSql(family.name)
  sql += `INSERT INTO public.genre_families (id, name) VALUES ('${familyId}', '${familyName}') ON CONFLICT (id) DO UPDATE SET name = excluded.name;\n`
}

sql += '\n'

// Insert Main Genres (genre_types)
for (const family of families) {
  const familyId = createSlug(family.name)
  for (const mainGenre of family.mainGenres) {
    const mainGenreId = createSlug(mainGenre.name)
    const mainGenreName = escapeSql(mainGenre.name)
    sql += `INSERT INTO public.genre_types (id, family_id, name) VALUES ('${mainGenreId}', '${familyId}', '${mainGenreName}') ON CONFLICT (id) DO UPDATE SET name = excluded.name, family_id = excluded.family_id;\n`
  }
}

sql += '\n'

// Insert Sub-Genres (genre_subtypes)
for (const family of families) {
  for (const mainGenre of family.mainGenres) {
    const mainGenreId = createSlug(mainGenre.name)
    for (const subGenre of mainGenre.subGenres) {
      const subGenreId = createSlug(subGenre.name)
      const subGenreName = escapeSql(subGenre.name)
      sql += `INSERT INTO public.genre_subtypes (id, type_id, name) VALUES ('${subGenreId}', '${mainGenreId}', '${subGenreName}') ON CONFLICT (id) DO UPDATE SET name = excluded.name, type_id = excluded.type_id;\n`
    }
  }
}

sql += '\nCOMMIT;\n'

// Write to file
const outputPath = path.join(process.cwd(), 'database', 'migrations', '026_seed_complete_genre_taxonomy.sql')
fs.writeFileSync(outputPath, sql)

console.log(`Generated migration file: ${outputPath}`)
console.log(`Total families: ${families.length}`)
console.log(`Total main genres: ${families.reduce((sum, f) => sum + f.mainGenres.length, 0)}`)
console.log(`Total sub-genres: ${families.reduce((sum, f) => sum + f.mainGenres.reduce((s, m) => s + m.subGenres.length, 0), 0)}`)

