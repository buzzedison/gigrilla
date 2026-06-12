'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import { cn } from '../../../components/ui/utils'

export interface TerritoryMultiSelectOption {
  value: string
  label: string
}

interface TerritoryMultiSelectProps {
  options: TerritoryMultiSelectOption[]
  selectedValues: string[]
  onToggle: (value: string) => void
  placeholder: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  selectedTone?: 'purple' | 'amber'
}

export function TerritoryMultiSelect({
  options,
  selectedValues,
  onToggle,
  placeholder,
  searchPlaceholder = 'Search territories or countries...',
  emptyText = 'No territories found.',
  className,
  selectedTone = 'purple'
}: TerritoryMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const selectedCount = selectedValues.length
  const selectedValueSet = new Set(selectedValues)
  const selectedLabel = selectedCount === 1
    ? options.find((option) => option.value === selectedValues[0])?.label || '1 selected'
    : `${selectedCount} selected`
  const activeCheckClassName = selectedTone === 'amber' ? 'text-amber-600' : 'text-purple-600'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn('w-full justify-between border-gray-200 bg-slate-50 px-3 text-left font-medium text-gray-700 hover:bg-slate-100 md:w-80', className)}
        >
          <span className="truncate">{selectedCount > 0 ? selectedLabel : placeholder}</span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValueSet.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => onToggle(option.value)}
                    className="cursor-pointer"
                  >
                    <span className="flex h-4 w-4 items-center justify-center">
                      {isSelected && <Check className={cn('h-3.5 w-3.5', activeCheckClassName)} />}
                    </span>
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
          <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
            <span className="text-xs text-gray-500">
              {selectedCount === 0 ? 'No selections yet' : `${selectedCount} selected`}
            </span>
            <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
