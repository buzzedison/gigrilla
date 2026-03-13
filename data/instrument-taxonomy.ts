import {
  INSTRUMENT_TAXONOMY_NOTION_ALIGNED,
  type InstrumentGroup as NotionInstrumentGroup,
  type InstrumentFamily as NotionInstrumentFamily,
  type InstrumentVariant as NotionInstrumentVariant
} from './instrument-taxonomy-aligned'

export interface InstrumentGroupSchema {
  id: string
  name: string
  allLabel: string
  families: string[]
}

export interface InstrumentGroupList {
  id: string
  name: string
  items: string[]
}

export interface Type5InstrumentOption {
  id: string
  label: string
}

export interface SubInstrument {
  id: string
  label: string
}

export interface Instrument3 {
  id: string
  label: string
  variants?: SubInstrument[]
}

export interface InstrumentGroup3 {
  id: string
  name: string
  icon: string
  allLabel: string
  otherLabel: string
  instruments: Instrument3[]
}

const GROUP_ID_MAP: Record<string, string> = {
  string: 'strings',
  wind: 'wind',
  percussion: 'percussion',
  keyboard: 'keyboard',
  electronic: 'electronic'
}

const GROUP_ICON_MAP: Record<string, string> = {
  strings: '🎸',
  wind: '🎷',
  percussion: '🥁',
  keyboard: '🎹',
  electronic: '🎛️'
}

const toLegacyGroupId = (groupId: string) => GROUP_ID_MAP[groupId] ?? groupId

const toInstrument3 = (family: NotionInstrumentFamily): Instrument3 => ({
  id: family.id,
  label: family.label,
  variants: family.variants?.map((variant: NotionInstrumentVariant) => ({
    id: variant.id,
    label: variant.label
  }))
})

const toInstrumentGroup3 = (group: NotionInstrumentGroup): InstrumentGroup3 => {
  const legacyGroupId = toLegacyGroupId(group.id)
  return {
    id: legacyGroupId,
    name: group.label,
    icon: GROUP_ICON_MAP[legacyGroupId] ?? '🎵',
    allLabel: group.allOptionLabel,
    otherLabel: group.otherOptionLabel,
    instruments: group.families.map(toInstrument3)
  }
}

export const INSTRUMENT_GROUP_SCHEMA: InstrumentGroupSchema[] = INSTRUMENT_TAXONOMY_NOTION_ALIGNED.map((group) => ({
  id: toLegacyGroupId(group.id),
  name: group.label,
  allLabel: group.allOptionLabel,
  families: group.families.map((family) => family.label)
}))

export const CREW_INSTRUMENT_ROLE_GROUPS: InstrumentGroupList[] = INSTRUMENT_GROUP_SCHEMA.map((group) => ({
  id: group.id,
  name: group.name,
  items: [group.allLabel, ...group.families]
}))

export const AUDITION_INSTRUMENT_GROUPS: InstrumentGroupList[] = [
  ...INSTRUMENT_GROUP_SCHEMA.map((group) => ({
    id: group.id,
    name: group.name,
    items: [...group.families]
  })),
  {
    id: 'other',
    name: 'Other',
    items: ['Other']
  }
]

export const TYPE5_INSTRUMENT_GROUP_OPTIONS: Type5InstrumentOption[] = INSTRUMENT_GROUP_SCHEMA.map((group) => ({
  id: group.id,
  label: group.name
}))

export const TYPE5_MAIN_INSTRUMENT_FAMILY_OPTIONS: Type5InstrumentOption[] =
  INSTRUMENT_TAXONOMY_NOTION_ALIGNED.flatMap((group) =>
    group.families.map((family) => ({
      id: family.id,
      label: `${group.label}: ${family.label}`
    }))
  )

export const INSTRUMENT_TAXONOMY_3TIER: InstrumentGroup3[] =
  INSTRUMENT_TAXONOMY_NOTION_ALIGNED.map(toInstrumentGroup3)

export const ALL_INSTRUMENTS_FLAT: { groupId: string; groupName: string; instrumentId: string; label: string }[] =
  INSTRUMENT_TAXONOMY_3TIER.flatMap(group =>
    group.instruments.map(inst => ({
      groupId: group.id,
      groupName: group.name,
      instrumentId: inst.id,
      label: inst.label
    }))
  )

export function getInstrumentVariants(groupId: string, instrumentId: string): SubInstrument[] {
  const group = INSTRUMENT_TAXONOMY_3TIER.find(g => g.id === groupId)
  const instrument = group?.instruments.find(i => i.id === instrumentId)
  return instrument?.variants ?? []
}
