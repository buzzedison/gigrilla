"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "./input"
import { Check } from "lucide-react"
import { cn } from "../../../lib/utils"

export interface AutocompleteInputProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
  className?: string
  id?: string
}

/**
 * Autocomplete input component for labels and publishers
 * Provides filtered suggestions as user types
 */
export function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
  id
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input
  useEffect(() => {
    if (!value || value.length < 2) {
      setFilteredSuggestions([])
      setIsOpen(false)
      return
    }

    const searchTerm = value.toLowerCase()
    const filtered = suggestions
      .filter(suggestion => suggestion.toLowerCase().includes(searchTerm))
      .slice(0, 10) // Limit to 10 suggestions

    setFilteredSuggestions(filtered)
    setIsOpen(filtered.length > 0)
    setHighlightedIndex(0)
  }, [value, suggestions])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (suggestion: string) => {
    onChange(suggestion)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredSuggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case "Enter":
        e.preventDefault()
        if (filteredSuggestions[highlightedIndex]) {
          handleSelect(filteredSuggestions[highlightedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        break
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleInputFocus = () => {
    if (filteredSuggestions.length > 0) {
      setIsOpen(true)
    }
  }

  // Check if current value matches exactly
  const exactMatch = suggestions.some(s => s.toLowerCase() === value.toLowerCase())

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(className, exactMatch && "pr-10")}
          autoComplete="off"
        />
        {exactMatch && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Check className="w-4 h-4 text-green-600" />
          </div>
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => {
            const isHighlighted = index === highlightedIndex
            const matchIndex = suggestion.toLowerCase().indexOf(value.toLowerCase())
            const beforeMatch = suggestion.slice(0, matchIndex)
            const match = suggestion.slice(matchIndex, matchIndex + value.length)
            const afterMatch = suggestion.slice(matchIndex + value.length)

            return (
              <button
                key={suggestion}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors",
                  isHighlighted
                    ? "bg-purple-50 text-purple-900"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {beforeMatch}
                <span className="font-semibold text-purple-600">{match}</span>
                {afterMatch}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
