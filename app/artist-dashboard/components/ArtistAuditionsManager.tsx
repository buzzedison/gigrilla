"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../../components/ui/select'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Checkbox } from '../../components/ui/checkbox'
import { Badge } from '../../components/ui/badge'
import { useAuth } from '../../../lib/auth-context'
import { Megaphone, Plus, Edit3, Trash2, CheckCircle, X, Calendar, Clock } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { formatDateDDMMMyyyy } from '@/lib/date-format'
import {
  VOCALIST_TYPES,
  VOCAL_SOUND_DESCRIPTORS as RAW_VOCAL_SOUND_DESCRIPTORS,
  VOCAL_GENRE_DESCRIPTORS as RAW_VOCAL_GENRE_DESCRIPTORS
} from '@/data/vocal-descriptors'
import { getType5InstrumentOptions } from '@/data/instrument-taxonomy-aligned'
import { MultiSelectChips, type MultiSelectOption } from '../../components/ui/multi-select-chips'

interface AuditionAdvert {
  id: string
  advert_type: string
  instruments?: string[]
  vocalist_types?: string[]
  vocalist_sound_descriptors?: string[]
  vocalist_genre_descriptors?: string[]
  producer_type?: string
  lyricist_type?: string
  composer_type?: string
  collaboration_direction?: string
  genre_selection: 'any' | 'specific'
  genres?: string[]
  headline: string
  description: string
  includes_fixed_fee: boolean
  includes_royalty_share: boolean
  deadline_type: 'asap' | 'specific'
  deadline_date?: string
  expiry_date: string
  expiry_time: string
  published_at: string
  edited_at?: string
  created_at: string
}

interface Notification {
  type: 'success' | 'error'
  message: string
  visible: boolean
}

const ADVERT_TYPES = [
  { value: 'conductor-audition', label: 'Conductor - Wanted For Audition' },
  { value: 'conductor-live', label: 'Conductor - Wanted For Live Performance' },
  { value: 'conductor-recording', label: 'Conductor - Wanted For Recording' },
  { value: 'conductor-rehearsal', label: 'Conductor - Wanted For Rehearsal' },
  { value: 'featured-artist-offered', label: 'Featured Artist - Offered For Collaboration' },
  { value: 'featured-artist-wanted', label: 'Featured Artist - Wanted For Collaboration' },
  { value: 'instrumentalist-audition', label: 'Instrumentalist - Wanted For Audition', requiresInstrument: true },
  { value: 'instrumentalist-live', label: 'Instrumentalist - Wanted For Live Performance', requiresInstrument: true },
  { value: 'instrumentalist-recording', label: 'Instrumentalist - Wanted For Recording', requiresInstrument: true },
  { value: 'instrumentalist-rehearsal', label: 'Instrumentalist - Wanted For Rehearsal', requiresInstrument: true },
  { value: 'lyricist', label: 'Musical Lyricist', requiresLyricistType: true, requiresDirection: true },
  { value: 'composer', label: 'Musical Composer', requiresComposerType: true, requiresDirection: true },
  { value: 'producer-studio', label: 'Producer (Studio) - Wanted', requiresProducerType: true },
  { value: 'producer-creative', label: 'Producer (Creative) - Wanted', requiresProducerType: true },
  { value: 'vocalist-audition', label: 'Vocalist - Wanted For Audition', requiresVocalistType: true },
  { value: 'vocalist-live', label: 'Vocalist - Wanted For Live Performance', requiresVocalistType: true },
  { value: 'vocalist-recording', label: 'Vocalist - Wanted For Recording', requiresVocalistType: true },
  { value: 'vocalist-rehearsal', label: 'Vocalist - Wanted For Rehearsal', requiresVocalistType: true }
]

// Convert instrument options for multi-select
const INSTRUMENT_OPTIONS: MultiSelectOption[] = getType5InstrumentOptions().map(opt => ({
  id: opt.id,
  label: opt.label,
  group: opt.group
}))

// Vocal role options (matching Artist Type 4)
const VOCAL_ROLE_OPTIONS: MultiSelectOption[] = [
  { id: 'all-vocals', label: 'All Vocals', description: 'Select all three vocal roles below' },
  { id: 'lead', label: 'Lead', description: 'Primary/featured vocal performances' },
  { id: 'backing', label: 'Backing', description: 'Support vocal performances' },
  { id: 'harmony', label: 'Harmony', description: 'Harmony vocal arrangements and parts' }
]

// Sound-based vocal descriptors
const VOCAL_SOUND_DESCRIPTOR_OPTIONS: MultiSelectOption[] = RAW_VOCAL_SOUND_DESCRIPTORS.map(item => ({
  id: item.id,
  label: item.label,
  group: item.group
}))

// Genre-based vocal descriptors
const VOCAL_GENRE_DESCRIPTOR_OPTIONS: MultiSelectOption[] = RAW_VOCAL_GENRE_DESCRIPTORS.map(item => ({
  id: item.id,
  label: item.label,
  group: item.group
}))

const PRODUCER_STUDIO_TYPES = ['Editing/Tuning', 'Mixing/Mastering', 'Studio Overseer']
const PRODUCER_CREATIVE_TYPES = ['All-in-One', 'Beatmaker', 'Coach/Mentor']
const LYRICIST_TYPES = ['Entire Lyrics', 'Part Lyrics', 'Co-write Lyrics']
const COMPOSER_TYPES = ['Entire Music', 'Part Music', 'Co-write Music']
const COLLABORATION_DIRECTIONS = ['Wanted', 'Offered']

const GENRE_FAMILIES = [
  'African', 'Asian Pop', 'Classical', 'Country', 'Dance & EDM', 'Downtempo & Ambient',
  'Experimental & Avant-Garde', 'Folk & Roots', 'Hip-Hop & Rap', 'Industrial & Gothic',
  'Latin', 'Metal & Punk', 'Pop', 'Reggae & Dancehall', 'Religious & Spiritual',
  'Rhythm & Blues', 'Rock', 'SoundTrack, Film, TV & Stage', 'South American',
  'The Blues & Jazz', 'World', 'Other'
]

export function ArtistAuditionsManager() {
  const { user } = useAuth()
  const [adverts, setAdverts] = useState<AuditionAdvert[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [advertType, setAdvertType] = useState('')
  const [instruments, setInstruments] = useState<string[]>([])
  const [vocalistTypes, setVocalistTypes] = useState<string[]>([])
  const [vocalistSoundDescriptors, setVocalistSoundDescriptors] = useState<string[]>([])
  const [vocalistGenreDescriptors, setVocalistGenreDescriptors] = useState<string[]>([])
  const [producerType, setProducerType] = useState('')
  const [lyricistType, setLyricistType] = useState('')
  const [composerType, setComposerType] = useState('')
  const [collaborationDirection, setCollaborationDirection] = useState('')
  const [genreSelection, setGenreSelection] = useState<'any' | 'specific'>('any')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [headline, setHeadline] = useState('')
  const [description, setDescription] = useState('')
  const [includesFixedFee, setIncludesFixedFee] = useState(false)
  const [includesRoyaltyShare, setIncludesRoyaltyShare] = useState(false)
  const [deadlineType, setDeadlineType] = useState<'asap' | 'specific'>('asap')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [expiryTime, setExpiryTime] = useState('23:59')

  useEffect(() => {
    loadAdverts()
  }, [user])

  const loadAdverts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/artist-auditions')
      const result = await response.json()

      if (result.data) {
        setAdverts(result.data)
      }
    } catch (error) {
      console.error('Error loading adverts:', error)
      showNotification('error', 'Failed to load adverts')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAdvertType('')
    setInstruments([])
    setVocalistTypes([])
    setVocalistSoundDescriptors([])
    setVocalistGenreDescriptors([])
    setProducerType('')
    setLyricistType('')
    setComposerType('')
    setCollaborationDirection('')
    setGenreSelection('any')
    setSelectedGenres([])
    setHeadline('')
    setDescription('')
    setIncludesFixedFee(false)
    setIncludesRoyaltyShare(false)
    setDeadlineType('asap')
    setDeadlineDate('')
    setExpiryDate('')
    setExpiryTime('23:59')
    setEditingId(null)
  }

  const handleEdit = (advert: AuditionAdvert) => {
    setEditingId(advert.id)
    setAdvertType(advert.advert_type)
    setInstruments(advert.instruments || [])
    setVocalistTypes(advert.vocalist_types || [])
    setVocalistSoundDescriptors(advert.vocalist_sound_descriptors || [])
    setVocalistGenreDescriptors(advert.vocalist_genre_descriptors || [])
    setProducerType(advert.producer_type || '')
    setLyricistType(advert.lyricist_type || '')
    setComposerType(advert.composer_type || '')
    setCollaborationDirection(advert.collaboration_direction || '')
    setGenreSelection(advert.genre_selection)
    setSelectedGenres(advert.genres || [])
    setHeadline(advert.headline)
    setDescription(advert.description)
    setIncludesFixedFee(advert.includes_fixed_fee)
    setIncludesRoyaltyShare(advert.includes_royalty_share)
    setDeadlineType(advert.deadline_type)
    setDeadlineDate(advert.deadline_date || '')
    setExpiryDate(advert.expiry_date)
    setExpiryTime(advert.expiry_time)
  }

  const handleSave = async () => {
    if (!advertType || !headline || !description || !expiryDate) {
      showNotification('error', 'Please fill in all required fields')
      return
    }

    if (headline.length > 50) {
      showNotification('error', 'Headline must be 50 characters or less')
      return
    }

    if (description.length > 160) {
      showNotification('error', 'Description must be 160 characters or less')
      return
    }

    if (genreSelection === 'specific' && selectedGenres.length === 0) {
      showNotification('error', 'Please select at least one genre')
      return
    }

    if (genreSelection === 'specific' && selectedGenres.length > 5) {
      showNotification('error', 'Maximum 5 genres allowed')
      return
    }

    if (deadlineType === 'specific' && !deadlineDate) {
      showNotification('error', 'Please select a Deadline Date')
      return
    }

    const maxDate = getMaxDate()
    if (deadlineType === 'specific' && deadlineDate && deadlineDate > maxDate) {
      showNotification('error', 'Deadline Date must be within 3 months from today')
      return
    }

    if (expiryDate > maxDate) {
      showNotification('error', 'Advert Expiry Date must be within 3 months from today')
      return
    }

    if (selectedAdvertType?.requiresVocalistType && vocalistTypes.length === 0) {
      showNotification('error', 'Please select at least one Vocalist Type')
      return
    }

    if (selectedAdvertType?.requiresInstrument && instruments.length === 0) {
      showNotification('error', 'Please select at least one Instrument')
      return
    }

    if (selectedAdvertType?.requiresProducerType && !producerType) {
      showNotification('error', 'Please select a Producer Type')
      return
    }

    if (selectedAdvertType?.requiresLyricistType && !lyricistType) {
      showNotification('error', 'Please select a Lyricist Type')
      return
    }

    if (selectedAdvertType?.requiresComposerType && !composerType) {
      showNotification('error', 'Please select a Composer Type')
      return
    }

    if (selectedAdvertType?.requiresDirection && !collaborationDirection) {
      showNotification('error', 'Please select a Direction')
      return
    }

    try {
      setSaving(true)
      const payload = {
        id: editingId,
        advert_type: advertType,
        instruments,
        vocalist_types: vocalistTypes,
        vocalist_sound_descriptors: selectedAdvertType?.requiresVocalistType ? vocalistSoundDescriptors : [],
        vocalist_genre_descriptors: selectedAdvertType?.requiresVocalistType ? vocalistGenreDescriptors : [],
        producer_type: producerType,
        lyricist_type: lyricistType,
        composer_type: composerType,
        collaboration_direction: collaborationDirection,
        genre_selection: genreSelection,
        genres: genreSelection === 'specific' ? selectedGenres : [],
        headline,
        description,
        includes_fixed_fee: includesFixedFee,
        includes_royalty_share: includesRoyaltyShare,
        deadline_type: deadlineType,
        deadline_date: deadlineType === 'specific' ? deadlineDate : null,
        expiry_date: expiryDate,
        expiry_time: expiryTime
      }

      const response = await fetch('/api/artist-auditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to save advert')
      }

      showNotification('success', editingId ? 'Advert updated successfully' : 'Advert added successfully')
      resetForm()
      loadAdverts()
    } catch (error) {
      console.error('Error saving advert:', error)
      showNotification('error', 'Failed to save advert')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advert?')) return

    try {
      const response = await fetch(`/api/artist-auditions?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete advert')
      }

      showNotification('success', 'Advert deleted successfully')
      loadAdverts()
    } catch (error) {
      console.error('Error deleting advert:', error)
      showNotification('error', 'Failed to delete advert')
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, visible: true })
    setTimeout(() => {
      setNotification(prev => prev ? { ...prev, visible: false } : null)
    }, 3000)
  }

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre))
    } else if (selectedGenres.length < 5) {
      setSelectedGenres([...selectedGenres, genre])
    }
  }

  const getMaxDate = () => {
    const today = new Date()
    const maxDate = new Date(today.setMonth(today.getMonth() + 3))
    return maxDate.toISOString().split('T')[0]
  }

  const applyMaxAdvertDuration = () => {
    setExpiryDate(getMaxDate())
    setExpiryTime('23:59')
  }

  const selectedAdvertType = ADVERT_TYPES.find(t => t.value === advertType)

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300",
            notification.visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
            notification.type === 'success' ? "bg-green-500" : "bg-red-500"
          )}
        >
          <div className="flex items-center space-x-2 text-white">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Add/Edit Advert Form */}
      <Card id="artist-auditions-add" className="scroll-mt-28">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Megaphone className="w-5 h-5" />
            <span>{editingId ? 'Edit' : 'Add'} Audition & Collaboration Advert</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="advert-type">Type of Advert *</Label>
              <Select value={advertType} onValueChange={(value) => {
                setAdvertType(value)
                const typeConfig = ADVERT_TYPES.find(type => type.value === value)
                if (!typeConfig?.requiresVocalistType) {
                  // Clear vocalist fields if not needed
                  setVocalistTypes([])
                  setVocalistSoundDescriptors([])
                  setVocalistGenreDescriptors([])
                }
                if (!typeConfig?.requiresInstrument) {
                  // Clear instrument fields if not needed
                  setInstruments([])
                }
              }}>
                <SelectTrigger id="advert-type">
                  <SelectValue placeholder="Select advert type..." />
                </SelectTrigger>
                <SelectContent>
                  {ADVERT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAdvertType?.requiresInstrument && (
              <MultiSelectChips
                label="Instruments *"
                options={INSTRUMENT_OPTIONS}
                value={instruments}
                onChange={setInstruments}
                placeholder="Select instruments you need..."
                grouped={true}
                allowSelectAll={true}
              />
            )}

            {selectedAdvertType?.requiresVocalistType && (
              <div className="space-y-4 border border-purple-100 rounded-lg p-4 bg-purple-50/30">
                <div className="text-sm font-semibold text-purple-900 mb-2">
                  Vocalist Requirements
                </div>

                <MultiSelectChips
                  label="Vocalist Roles *"
                  options={VOCAL_ROLE_OPTIONS}
                  value={vocalistTypes}
                  onChange={(newValues) => {
                    // Handle "All Vocals" logic
                    if (newValues.includes('all-vocals')) {
                      setVocalistTypes(['all-vocals', 'lead', 'backing', 'harmony'])
                    } else {
                      setVocalistTypes(newValues)
                    }
                  }}
                  placeholder="Select vocal roles needed..."
                  maxSelections={4}
                />

                <MultiSelectChips
                  label="Sound-Based Voice Descriptors (Optional)"
                  options={VOCAL_SOUND_DESCRIPTOR_OPTIONS}
                  value={vocalistSoundDescriptors}
                  onChange={setVocalistSoundDescriptors}
                  placeholder="Select sound characteristics..."
                  grouped={true}
                />

                <MultiSelectChips
                  label="Genre-Based Voice Descriptors (Optional)"
                  options={VOCAL_GENRE_DESCRIPTOR_OPTIONS}
                  value={vocalistGenreDescriptors}
                  onChange={setVocalistGenreDescriptors}
                  placeholder="Select genre styles..."
                  grouped={true}
                />
              </div>
            )}

            {selectedAdvertType?.requiresProducerType && (
              <div className="space-y-2">
                <Label htmlFor="producer-type">Producer Type *</Label>
                <Select value={producerType} onValueChange={setProducerType}>
                  <SelectTrigger id="producer-type">
                    <SelectValue placeholder="Select producer type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(advertType.includes('studio') ? PRODUCER_STUDIO_TYPES : PRODUCER_CREATIVE_TYPES).map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedAdvertType?.requiresLyricistType && (
              <div className="space-y-2">
                <Label htmlFor="lyricist-type">Lyricist Type *</Label>
                <Select value={lyricistType} onValueChange={setLyricistType}>
                  <SelectTrigger id="lyricist-type">
                    <SelectValue placeholder="Select lyricist type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LYRICIST_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedAdvertType?.requiresComposerType && (
              <div className="space-y-2">
                <Label htmlFor="composer-type">Composer Type *</Label>
                <Select value={composerType} onValueChange={setComposerType}>
                  <SelectTrigger id="composer-type">
                    <SelectValue placeholder="Select composer type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPOSER_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedAdvertType?.requiresDirection && (
              <div className="space-y-2">
                <Label htmlFor="direction">Direction *</Label>
                <Select value={collaborationDirection} onValueChange={setCollaborationDirection}>
                  <SelectTrigger id="direction">
                    <SelectValue placeholder="Select direction..." />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLABORATION_DIRECTIONS.map(dir => (
                      <SelectItem key={dir} value={dir}>
                        {dir}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-4">
              <Label>Genre Selection</Label>
              <RadioGroup value={genreSelection} onValueChange={(val: 'any' | 'specific') => setGenreSelection(val)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="any" id="any-genre" />
                  <Label htmlFor="any-genre" className="font-normal cursor-pointer">
                    Any Genre
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="specific-genre" />
                  <Label htmlFor="specific-genre" className="font-normal cursor-pointer">
                    Specific Genres (Up to five genre families)
                  </Label>
                </div>
              </RadioGroup>

              {genreSelection === 'specific' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                  {GENRE_FAMILIES.map(genre => (
                    <div key={genre} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genre-${genre}`}
                        checked={selectedGenres.includes(genre)}
                        onCheckedChange={() => toggleGenre(genre)}
                        disabled={!selectedGenres.includes(genre) && selectedGenres.length >= 5}
                      />
                      <Label htmlFor={`genre-${genre}`} className="text-sm cursor-pointer">
                        {genre}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Advert Headline * (50 characters max)</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value.slice(0, 50))}
                placeholder="Write a short Advert Headline..."
                maxLength={50}
              />
              <p className="text-xs text-gray-500">{headline.length}/50 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description * (160 characters max)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 160))}
                placeholder="Write a description..."
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-gray-500">{description.length}/160 characters</p>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fixed-fee"
                  checked={includesFixedFee}
                  onCheckedChange={(checked) => setIncludesFixedFee(checked as boolean)}
                />
                <Label htmlFor="fixed-fee" className="cursor-pointer">
                  INCLUDES FIXED FEE? (negotiable during contract exchange)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="royalty-share"
                  checked={includesRoyaltyShare}
                  onCheckedChange={(checked) => setIncludesRoyaltyShare(checked as boolean)}
                />
                <Label htmlFor="royalty-share" className="cursor-pointer">
                  INCLUDES ROYALTY SHARE? (negotiable during contract exchange)
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Deadline</Label>
              <RadioGroup value={deadlineType} onValueChange={(val: 'asap' | 'specific') => setDeadlineType(val)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="asap" id="deadline-asap" />
                  <Label htmlFor="deadline-asap" className="font-normal cursor-pointer">
                    ASAP
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="deadline-specific" />
                  <Label htmlFor="deadline-specific" className="font-normal cursor-pointer">
                    Specific Date
                  </Label>
                </div>
              </RadioGroup>

              {deadlineType === 'specific' && (
                <div className="space-y-2">
                  <Label htmlFor="deadline-date">Deadline Date *</Label>
                  <Input
                    id="deadline-date"
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    max={getMaxDate()}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry-date">Date Advert Expires * (Max 3 months from today)</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  max={getMaxDate()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry-time">Time Advert Expires * (Your local time)</Label>
                <Input
                  id="expiry-time"
                  type="time"
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-start">
              <Button
                type="button"
                variant="outline"
                onClick={applyMaxAdvertDuration}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Clock className="w-4 h-4 mr-2" />
                Advertise for Maximum 3 Months from Today
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {editingId && (
              <Button
                variant="outline"
                onClick={resetForm}
              >
                Cancel Edit
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : editingId ? 'Update Advert' : 'Add Advert'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manage Adverts */}
      <Card id="artist-auditions-manage" className="scroll-mt-28">
        <CardHeader>
          <CardTitle>Manage Audition & Collaboration Adverts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading adverts...</div>
          ) : adverts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No adverts yet. Create your first advert above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adverts.map((advert) => (
                <div
                  key={advert.id}
                  className="border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  <div className="font-semibold text-lg text-purple-600 uppercase">
                    {advert.advert_type.replace(/-/g, ' ')}
                  </div>
                  {advert.instruments && advert.instruments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs font-medium text-gray-600">Instruments:</span>
                      {advert.instruments.map(inst => (
                        <Badge key={inst} variant="secondary" className="text-xs">
                          {inst}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {advert.vocalist_types && advert.vocalist_types.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs font-medium text-gray-600">Vocal Roles:</span>
                      {advert.vocalist_types.map(type => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {advert.vocalist_sound_descriptors && advert.vocalist_sound_descriptors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs font-medium text-gray-600">Sound:</span>
                      {advert.vocalist_sound_descriptors.map(desc => (
                        <Badge key={desc} variant="outline" className="text-xs">
                          {VOCAL_SOUND_DESCRIPTOR_OPTIONS.find(o => o.id === desc)?.label || desc}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {advert.vocalist_genre_descriptors && advert.vocalist_genre_descriptors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs font-medium text-gray-600">Genre Style:</span>
                      {advert.vocalist_genre_descriptors.map(desc => (
                        <Badge key={desc} variant="outline" className="text-xs">
                          {VOCAL_GENRE_DESCRIPTOR_OPTIONS.find(o => o.id === desc)?.label || desc}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {(advert.lyricist_type || advert.composer_type) && (
                    <div className="text-sm text-gray-600">
                      {advert.lyricist_type || advert.composer_type} - {advert.collaboration_direction}
                    </div>
                  )}
                  <div className="font-medium">{advert.headline}</div>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {advert.description}
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Genre:</span>{' '}
                      {advert.genre_selection === 'any'
                        ? 'ANY GENRE'
                        : advert.genres?.join('; ')}
                    </div>
                    <div>
                      <span className="font-medium">Fixed Fee:</span>{' '}
                      {advert.includes_fixed_fee ? 'NEGOTIABLE' : 'NO'}
                    </div>
                    <div>
                      <span className="font-medium">Royalties:</span>{' '}
                      {advert.includes_royalty_share ? 'NEGOTIABLE' : 'NO'}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Deadline:</span>{' '}
                      {advert.deadline_type === 'asap'
                        ? 'ASAP'
                        : formatDateDDMMMyyyy(advert.deadline_date)}
                    </div>
                    <div>
                      <span className="font-medium">Ad Expires:</span>{' '}
                      {formatDateDDMMMyyyy(advert.expiry_date)}
                      {advert.expiry_time ? ` ${advert.expiry_time}` : ''}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
                    <div>Published on {formatDateDDMMMyyyy(advert.published_at)}</div>
                    {advert.edited_at && (
                      <div>Edited on {formatDateDDMMMyyyy(advert.edited_at)}</div>
                    )}
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(advert)}
                      className="flex-1"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Ad
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(advert.id)}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Ad
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
