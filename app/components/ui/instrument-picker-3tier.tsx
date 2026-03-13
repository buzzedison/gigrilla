'use client'

import { useMemo, useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { INSTRUMENT_TAXONOMY_3TIER } from '../../../data/instrument-taxonomy'
import type { InstrumentGroup3, Instrument3, SubInstrument } from '../../../data/instrument-taxonomy'

// ─── Public types ──────────────────────────────────────────────────────────────

export interface SelectedInstrument {
  groupId: string
  groupName: string
  instrumentId: string
  instrumentLabel: string
  /** Defined when the user picked a specific sub-instrument variant */
  variantId?: string
  variantLabel?: string
}

const ALL_INSTRUMENT_ID = '__all__'
const OTHER_INSTRUMENT_ID = '__other__'

// ─── Serialise / deserialise for DB storage ────────────────────────────────────

/**
 * Turns selections into a pipe-delimited string for DB storage.
 * Format: "groupId:instrumentId" or "groupId:instrumentId:variantId"
 * e.g.  "strings:guitar:electric|strings:guitar:12-string|vocals:lead-vocals:soprano"
 */
export function serializeInstruments3Tier(items: SelectedInstrument[]): string {
  return items
    .map(i =>
      i.variantId
        ? `${i.groupId}:${i.instrumentId}:${i.variantId}`
        : `${i.groupId}:${i.instrumentId}`
    )
    .join('|')
}

/**
 * Reconstructs SelectedInstrument[] from a stored DB string.
 */
export function deserializeInstruments3Tier(stored: string | null | undefined): SelectedInstrument[] {
  if (!stored) return []
  return stored
    .split('|')
    .map((item): SelectedInstrument | null => {
      const [groupId, instrumentId, variantId] = item.split(':')
      if (!groupId || !instrumentId) return null
      const group = INSTRUMENT_TAXONOMY_3TIER.find(g => g.id === groupId)
      if (!group) return null

      if (instrumentId === ALL_INSTRUMENT_ID) {
        return {
          groupId,
          groupName: group.name,
          instrumentId,
          instrumentLabel: group.allLabel,
        }
      }

      if (instrumentId === OTHER_INSTRUMENT_ID) {
        return {
          groupId,
          groupName: group.name,
          instrumentId,
          instrumentLabel: group.otherLabel,
        }
      }

      const instrument = group.instruments.find(i => i.id === instrumentId)
      if (!instrument) return null
      const variant = variantId
        ? instrument.variants?.find(v => v.id === variantId)
        : undefined
      return {
        groupId,
        groupName: group.name,
        instrumentId,
        instrumentLabel: instrument.label,
        variantId: variantId || undefined,
        variantLabel: variant?.label,
      }
    })
    .filter((x): x is SelectedInstrument => x !== null)
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface InstrumentPicker3TierProps {
  value: SelectedInstrument[]
  onChange: (value: SelectedInstrument[]) => void
  /** Optional subset of group IDs to show — defaults to all groups */
  allowedGroups?: string[]
  className?: string
}

export function InstrumentPicker3Tier({
  value,
  onChange,
  allowedGroups,
  className,
}: InstrumentPicker3TierProps) {
  const groups = useMemo(() => (
    allowedGroups
      ? INSTRUMENT_TAXONOMY_3TIER.filter(g => allowedGroups.includes(g.id))
      : INSTRUMENT_TAXONOMY_3TIER
  ), [allowedGroups])

  const [activeGroupId, setActiveGroupId] = useState<string>(groups[0]?.id ?? '')
  const [expandedInstrumentId, setExpandedInstrumentId] = useState<string | null>(null)

  const activeGroup = groups.find(g => g.id === activeGroupId) ?? null

  // ── Selection helpers ──────────────────────────────────────────────────────

  const isVariantSelected = (groupId: string, instrumentId: string, variantId: string) =>
    value.some(
      s => s.groupId === groupId && s.instrumentId === instrumentId && s.variantId === variantId
    )

  const isInstrumentDirectlySelected = (groupId: string, instrumentId: string) =>
    value.some(
      s => s.groupId === groupId && s.instrumentId === instrumentId && !s.variantId
    )

  const countForInstrument = (groupId: string, instrumentId: string) =>
    value.filter(s => s.groupId === groupId && s.instrumentId === instrumentId).length

  const groupHasSelection = (groupId: string) => value.some(s => s.groupId === groupId)
  const isGroupOptionSelected = (groupId: string, optionId: string) =>
    value.some(s => s.groupId === groupId && s.instrumentId === optionId && !s.variantId)

  // ── Toggle handlers ────────────────────────────────────────────────────────

  /** Instrument with NO variants — direct toggle */
  const toggleInstrument = (group: InstrumentGroup3, instrument: Instrument3) => {
    const selected = isInstrumentDirectlySelected(group.id, instrument.id)
    if (selected) {
      onChange(value.filter(s => !(s.groupId === group.id && s.instrumentId === instrument.id && !s.variantId)))
    } else {
      const cleaned = value.filter(
        s => !(s.groupId === group.id && (s.instrumentId === ALL_INSTRUMENT_ID || s.instrumentId === OTHER_INSTRUMENT_ID))
      )
      onChange([...cleaned, {
        groupId: group.id,
        groupName: group.name,
        instrumentId: instrument.id,
        instrumentLabel: instrument.label,
      }])
    }
  }

  /** Specific variant toggle */
  const toggleVariant = (
    group: InstrumentGroup3,
    instrument: Instrument3,
    variant: SubInstrument
  ) => {
    const selected = isVariantSelected(group.id, instrument.id, variant.id)
    if (selected) {
      onChange(value.filter(
        s => !(s.groupId === group.id && s.instrumentId === instrument.id && s.variantId === variant.id)
      ))
    } else {
      // Remove the plain (no-variant) entry for this instrument if present
      const cleaned = value.filter(
        s => !(s.groupId === group.id && (
          (s.instrumentId === instrument.id && !s.variantId) ||
          s.instrumentId === ALL_INSTRUMENT_ID ||
          s.instrumentId === OTHER_INSTRUMENT_ID
        ))
      )
      onChange([...cleaned, {
        groupId: group.id,
        groupName: group.name,
        instrumentId: instrument.id,
        instrumentLabel: instrument.label,
        variantId: variant.id,
        variantLabel: variant.label,
      }])
    }
  }

  const toggleGroupOption = (group: InstrumentGroup3, optionId: typeof ALL_INSTRUMENT_ID | typeof OTHER_INSTRUMENT_ID) => {
    const selected = isGroupOptionSelected(group.id, optionId)
    if (selected) {
      onChange(value.filter(s => !(s.groupId === group.id && s.instrumentId === optionId && !s.variantId)))
      return
    }

    const cleaned = value.filter(s => s.groupId !== group.id)
    onChange([...cleaned, {
      groupId: group.id,
      groupName: group.name,
      instrumentId: optionId,
      instrumentLabel: optionId === ALL_INSTRUMENT_ID ? group.allLabel : group.otherLabel,
    }])
  }

  /** Remove one tag */
  const removeSelection = (sel: SelectedInstrument) => {
    onChange(value.filter(s => !(
      s.groupId === sel.groupId &&
      s.instrumentId === sel.instrumentId &&
      s.variantId === sel.variantId
    )))
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={`space-y-3 ${className ?? ''}`}>

      {/* ── Group tabs ── */}
      <div className="flex flex-wrap gap-1.5">
        {groups.map(group => {
          const hasSelection = groupHasSelection(group.id)
          const isActive = activeGroupId === group.id
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => {
                setActiveGroupId(group.id)
                setExpandedInstrumentId(null)
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : hasSelection
                    ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-400 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <span aria-hidden="true">{group.icon}</span>
              <span>
                {group.name
                  .replace(' Instruments', '')
                  .replace(' & Digital', '')}
              </span>
              {hasSelection && !isActive && (
                <span className="w-2 h-2 rounded-full bg-purple-500 ml-0.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* ── Instruments in active group ── */}
      {activeGroup && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => toggleGroupOption(activeGroup, ALL_INSTRUMENT_ID)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                isGroupOptionSelected(activeGroup.id, ALL_INSTRUMENT_ID)
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                isGroupOptionSelected(activeGroup.id, ALL_INSTRUMENT_ID)
                  ? 'border-purple-600 bg-purple-600'
                  : 'border-gray-400'
              }`}>
                {isGroupOptionSelected(activeGroup.id, ALL_INSTRUMENT_ID) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span>{activeGroup.allLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleGroupOption(activeGroup, OTHER_INSTRUMENT_ID)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                isGroupOptionSelected(activeGroup.id, OTHER_INSTRUMENT_ID)
                  ? 'border-orange-500 bg-orange-50 text-orange-900'
                  : 'border-gray-200 bg-white text-gray-800 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-900'
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                isGroupOptionSelected(activeGroup.id, OTHER_INSTRUMENT_ID)
                  ? 'border-orange-600 bg-orange-600'
                  : 'border-gray-400'
              }`}>
                {isGroupOptionSelected(activeGroup.id, OTHER_INSTRUMENT_ID) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span>{activeGroup.otherLabel}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeGroup.instruments.map(instrument => {
              const hasVariants = instrument.variants && instrument.variants.length > 0
              const isExpanded = expandedInstrumentId === instrument.id
              const count = countForInstrument(activeGroup.id, instrument.id)
              const directlySelected = isInstrumentDirectlySelected(activeGroup.id, instrument.id)

              return (
                <div key={instrument.id} className="col-span-1">

                  {/* ── Instrument button ── */}
                  <div
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                      count > 0
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 bg-white text-gray-800 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleInstrument(activeGroup, instrument)}
                        className="flex items-center gap-2 min-w-0 text-left"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                          directlySelected
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-400'
                        }`}>
                          {directlySelected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="truncate">{instrument.label}</span>
                      </button>
                      {count > 0 && hasVariants && (
                        <span className="text-xs text-purple-700 font-semibold shrink-0 bg-purple-100 px-1.5 py-0.5 rounded-full">
                          {count} selected
                        </span>
                      )}
                    </div>
                    {hasVariants && (
                      <button
                        type="button"
                        onClick={() => setExpandedInstrumentId(isExpanded ? null : instrument.id)}
                        className="shrink-0 rounded-md p-1 text-gray-500 hover:bg-purple-100 hover:text-purple-700"
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${instrument.label} variants`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>

                  {/* ── Variant checkboxes (expanded) ── */}
                  {hasVariants && isExpanded && (
                    <div className="mt-1.5 ml-3 pl-3 border-l-2 border-purple-300 space-y-0.5">
                      {instrument.variants!.map(variant => {
                        const selected = isVariantSelected(activeGroup.id, instrument.id, variant.id)
                        return (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => toggleVariant(activeGroup, instrument, variant)}
                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-sm font-medium transition-all text-left ${
                              selected
                                ? 'bg-purple-100 text-purple-900'
                                : 'text-gray-700 bg-white hover:bg-purple-50 hover:text-purple-900'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                              selected ? 'border-purple-600 bg-purple-600' : 'border-gray-400'
                            }`}>
                              {selected && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            {variant.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Selected tags ── */}
      {value.length > 0 && (
        <div className="rounded-lg bg-purple-50 border-2 border-purple-300 p-3">
          <p className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-2">
            Selected ({value.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {value.map((sel, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold shadow-sm"
              >
                {sel.variantLabel ? `${sel.instrumentLabel}: ${sel.variantLabel}` : sel.instrumentLabel}
                <button
                  type="button"
                  className="ml-0.5 p-0.5 rounded-full hover:bg-purple-500 transition-colors"
                  onClick={() => removeSelection(sel)}
                  aria-label={`Remove ${sel.variantLabel ? `${sel.instrumentLabel}: ${sel.variantLabel}` : sel.instrumentLabel}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {value.some((sel) => sel.instrumentId === OTHER_INSTRUMENT_ID) && (
            <div className="mt-3 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-800">
              You selected an “Other” instrument. Gigrilla will flag this for manual follow-up so the taxonomy can be updated.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
