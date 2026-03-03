import { getArtistTypeConfig } from "../data/artist-types"

type SelectionMap = Record<string, string[]>

const normalizeText = (value: string) => value.trim().toLowerCase()

const slugify = (value: string) =>
  normalizeText(value)
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const addSelection = (target: SelectionMap, groupId: string, optionId: string) => {
  if (!groupId || !optionId) return
  if (!target[groupId]) target[groupId] = []
  if (!target[groupId].includes(optionId)) {
    target[groupId].push(optionId)
  }
}

const resolveOption = (
  artistTypeId: number | null | undefined,
  token: string,
  preferredGroupId?: string
): { groupId: string; optionId: string } | null => {
  if (!artistTypeId) return null
  const config = getArtistTypeConfig(artistTypeId)
  if (!config) return null

  const raw = token.trim()
  if (!raw) return null
  const rawNorm = normalizeText(raw)
  const rawSlug = slugify(raw)

  const preferredGroup = preferredGroupId
    ? config.groups.find((group) => group.id === preferredGroupId)
    : undefined
  const groups = preferredGroup
    ? [preferredGroup, ...config.groups.filter((group) => group.id !== preferredGroup.id)]
    : config.groups

  for (const group of groups) {
    for (const option of group.options) {
      const optionIdNorm = normalizeText(option.id)
      const optionLabelNorm = normalizeText(option.label)
      const optionLabelSlug = slugify(option.label)

      if (
        rawNorm === optionIdNorm ||
        rawNorm === optionLabelNorm ||
        rawSlug === optionLabelSlug
      ) {
        return { groupId: group.id, optionId: option.id }
      }
    }
  }

  return null
}

const parseGroupAndValue = (value: string): { groupId: string; token: string } | null => {
  const trimmed = value.trim()
  if (!trimmed.includes(":")) return null
  const [groupId, ...rest] = trimmed.split(":")
  const token = rest.join(":").trim()
  if (!groupId?.trim() || !token) return null
  return { groupId: groupId.trim(), token }
}

export function normalizeArtistSubTypeSelections(
  rawValue: unknown,
  artistTypeId?: number | null
): SelectionMap {
  const normalized: SelectionMap = {}

  if (!rawValue) return normalized

  if (Array.isArray(rawValue)) {
    for (const rawItem of rawValue) {
      if (typeof rawItem !== "string") continue

      const parsed = parseGroupAndValue(rawItem)
      if (parsed) {
        const resolved = resolveOption(artistTypeId, parsed.token, parsed.groupId)
        if (resolved) {
          addSelection(normalized, resolved.groupId, resolved.optionId)
          continue
        }

        // If the format is already canonical and can't be resolved (e.g. stale config),
        // keep it so data is not lost.
        addSelection(normalized, parsed.groupId, parsed.token)
        continue
      }

      const resolved = resolveOption(artistTypeId, rawItem)
      if (resolved) {
        addSelection(normalized, resolved.groupId, resolved.optionId)
      }
    }

    return normalized
  }

  if (typeof rawValue === "object") {
    for (const [groupId, values] of Object.entries(rawValue as Record<string, unknown>)) {
      if (!groupId) continue

      const entries = Array.isArray(values) ? values : [values]
      for (const entry of entries) {
        if (typeof entry !== "string") continue

        const parsed = parseGroupAndValue(entry)
        if (parsed) {
          const resolved = resolveOption(artistTypeId, parsed.token, groupId || parsed.groupId)
          if (resolved) {
            addSelection(normalized, resolved.groupId, resolved.optionId)
            continue
          }
          addSelection(normalized, groupId, parsed.token)
          continue
        }

        const resolved = resolveOption(artistTypeId, entry, groupId)
        if (resolved) {
          addSelection(normalized, resolved.groupId, resolved.optionId)
        } else if (entry.trim()) {
          addSelection(normalized, groupId, entry.trim())
        }
      }
    }
  }

  return normalized
}

export function toStoredArtistSubTypes(
  rawValue: unknown,
  artistTypeId?: number | null
): string[] {
  const selections = normalizeArtistSubTypeSelections(rawValue, artistTypeId)
  return Object.entries(selections).flatMap(([groupId, values]) =>
    values
      .filter((value) => typeof value === "string" && value.trim().length > 0)
      .map((value) => `${groupId}:${value}`)
  )
}

export function getArtistSubTypeLabels(
  rawValue: unknown,
  artistTypeId?: number | null
): string[] {
  if (!artistTypeId) return []
  const config = getArtistTypeConfig(artistTypeId)
  if (!config) return []

  const selections = normalizeArtistSubTypeSelections(rawValue, artistTypeId)
  const labels: string[] = []

  for (const [groupId, values] of Object.entries(selections)) {
    const group = config.groups.find((item) => item.id === groupId)
    if (!group) continue

    for (const value of values) {
      const option = group.options.find((item) => item.id === value)
      if (option && !labels.includes(option.label)) {
        labels.push(option.label)
      }
    }
  }

  return labels
}
