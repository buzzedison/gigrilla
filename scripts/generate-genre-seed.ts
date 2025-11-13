import fs from 'node:fs'
import path from 'node:path'
import taxonomy from '../data/genre-taxonomy.json'

interface GenreSubType {
  id: string
  name: string
}

interface GenreType {
  id: string
  name: string
  subGenres: GenreSubType[]
}

interface GenreFamily {
  id: string
  name: string
  mainGenres: GenreType[]
}

const GENRE_FAMILIES = taxonomy as GenreFamily[]

const MIGRATION_HEADER = `-- 014_seed_genre_taxonomy.sql
-- Seeds canonical genre hierarchy based on data/genre-taxonomy.json

` as const

const outputLines: string[] = []

outputLines.push('begin;')

for (const family of GENRE_FAMILIES) {
  outputLines.push(
    `insert into public.genre_families (id, name) values ('${family.id}', '${family.name.replace(/'/g, "''")}')`
      + ' on conflict (id) do update set name = excluded.name;'
  )

  for (const type of family.mainGenres) {
    outputLines.push(
      `insert into public.genre_types (id, family_id, name) values ('${type.id}', '${family.id}', '${type.name.replace(/'/g, "''")}')`
        + ' on conflict (id) do update set name = excluded.name, family_id = excluded.family_id;'
    )

    for (const sub of type.subGenres) {
      outputLines.push(
        `insert into public.genre_subtypes (id, type_id, name) values ('${sub.id}', '${type.id}', '${sub.name.replace(/'/g, "''")}')`
          + ' on conflict (id) do update set name = excluded.name, type_id = excluded.type_id;'
      )
    }
  }
}

outputLines.push('commit;')

const migrationPath = path.join(process.cwd(), 'database', 'migrations', '014_seed_genre_taxonomy.sql')
fs.writeFileSync(migrationPath, MIGRATION_HEADER + outputLines.join('\n') + '\n')

console.log(`✅ Wrote genre seed migration to ${migrationPath}`)
