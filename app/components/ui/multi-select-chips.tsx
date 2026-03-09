'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { Badge } from './badge'
import { Button } from './button'

export interface MultiSelectOption {
  id: string
  label: string
  group?: string
  description?: string
}

export interface MultiSelectChipsProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  label: string
  placeholder?: string
  maxSelections?: number
  className?: string
  /** Show grouped options in collapsible sections */
  grouped?: boolean
  /** Allow "Select All" within groups */
  allowSelectAll?: boolean
}

/**
 * Multi-select chip component for auditions/collabs
 * Provides a clean chip-based UI instead of unwieldy dropdowns
 */
export function MultiSelectChips({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select options...',
  maxSelections,
  className,
  grouped = false,
  allowSelectAll = false
}: MultiSelectChipsProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Group options if needed
  const groupedOptions = grouped
    ? options.reduce((acc, opt) => {
        const groupKey = opt.group || 'Other'
        if (!acc[groupKey]) acc[groupKey] = []
        acc[groupKey].push(opt)
        return acc
      }, {} as Record<string, MultiSelectOption[]>)
    : { 'All': options }

  const toggleOption = (optionId: string) => {
    if (value.includes(optionId)) {
      onChange(value.filter(id => id !== optionId))
    } else {
      if (maxSelections && value.length >= maxSelections) return
      onChange([...value, optionId])
    }
  }

  const toggleGroup = (groupOptions: MultiSelectOption[]) => {
    const groupIds = groupOptions.map(opt => opt.id)
    const allSelected = groupIds.every(id => value.includes(id))

    if (allSelected) {
      // Deselect all in group
      onChange(value.filter(id => !groupIds.includes(id)))
    } else {
      // Select all in group (respecting max selections)
      const remaining = maxSelections ? Math.max(0, maxSelections - value.length) : Infinity
      const toAdd = groupIds.filter(id => !value.includes(id)).slice(0, remaining)
      onChange([...value, ...toAdd])
    }
  }

  const removeOption = (optionId: string) => {
    onChange(value.filter(id => id !== optionId))
  }

  const selectedOptions = options.filter(opt => value.includes(opt.id))
  const isMaxReached = maxSelections && value.length >= maxSelections

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {maxSelections && (
            <span className="ml-2 text-xs text-gray-500">
              ({value.length}/{maxSelections} selected)
            </span>
          )}
        </label>
        {isMaxReached && (
          <span className="text-xs text-orange-600 font-medium">
            Maximum reached
          </span>
        )}
      </div>

      {/* Selected chips display */}
      <div className="min-h-[42px] border border-gray-300 rounded-md p-2 bg-white">
        {selectedOptions.length === 0 ? (
          <span className="text-sm text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map(option => (
              <Badge
                key={option.id}
                variant="secondary"
                className="bg-purple-100 text-purple-800 hover:bg-purple-200 pr-1"
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="ml-1 hover:bg-purple-300 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Toggle dropdown button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between text-left font-normal"
      >
        <span className="text-sm">
          {isOpen ? 'Hide options' : 'Show options'}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 opacity-50" />
        ) : (
          <ChevronDown className="w-4 h-4 opacity-50" />
        )}
      </Button>

      {/* Options list */}
      {isOpen && (
        <div className="border border-gray-200 rounded-md p-3 bg-gray-50 max-h-[400px] overflow-y-auto space-y-3">
          {Object.entries(groupedOptions).map(([groupName, groupOptions]) => {
            const groupIds = groupOptions.map(opt => opt.id)
            const allGroupSelected = groupIds.every(id => value.includes(id))
            const someGroupSelected = groupIds.some(id => value.includes(id))

            return (
              <div key={groupName} className="space-y-2">
                {/* Group header (only show if actually grouped) */}
                {grouped && (
                  <div className="flex items-center justify-between pb-1 border-b border-gray-300">
                    <span className="text-sm font-semibold text-gray-700">
                      {groupName}
                    </span>
                    {allowSelectAll && (
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupOptions)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        {allGroupSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>
                )}

                {/* Group options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {groupOptions.map(option => {
                    const isSelected = value.includes(option.id)
                    const isDisabled = !isSelected && isMaxReached

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => !isDisabled && toggleOption(option.id)}
                        disabled={isDisabled ? true : undefined}
                        className={cn(
                          "text-left rounded-md border px-3 py-2 transition-all text-sm",
                          isSelected
                            ? "border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md font-medium"
                            : "border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{option.label}</span>
                          {isSelected && <span className="text-xs">✓</span>}
                        </div>
                        {option.description && (
                          <p className={cn(
                            "mt-1 text-xs",
                            isSelected ? "text-purple-100" : "text-gray-600"
                          )}>
                            {option.description}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Help text */}
      {maxSelections && (
        <p className="text-xs text-gray-500">
          Select up to {maxSelections} option{maxSelections > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
