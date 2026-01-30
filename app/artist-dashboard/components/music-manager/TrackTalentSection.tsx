'use client'

import { useState } from 'react'
import { Plus, X, User, Music, Mic, Settings } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Label } from '../../../components/ui/label'
import { TrackData, creatorRoleOptions, producerRoleOptions, sessionArtistRoleOptions } from './types'

interface TrackTalentSectionProps {
  track: TrackData
  trackIndex: number
  onUpdate: (field: keyof TrackData, value: unknown) => void
  onInviteArtist?: (email: string, name: string) => void
}

export function TrackTalentSection({ track, trackIndex, onUpdate, onInviteArtist }: TrackTalentSectionProps) {
  const addPrimaryArtist = () => {
    const newArtist = {
      id: crypto.randomUUID(),
      name: '',
      isni: '',
      confirmed: false
    }
    onUpdate('primaryArtists', [...track.primaryArtists, newArtist])
  }

  const updatePrimaryArtist = (artistId: string, field: 'name' | 'isni' | 'confirmed', value: string | boolean) => {
    onUpdate('primaryArtists', track.primaryArtists.map(a =>
      a.id === artistId ? { ...a, [field]: value } : a
    ))
  }

  const removePrimaryArtist = (artistId: string) => {
    onUpdate('primaryArtists', track.primaryArtists.filter(a => a.id !== artistId))
  }

  const addFeaturedArtist = () => {
    const newArtist = {
      id: crypto.randomUUID(),
      name: '',
      isni: '',
      confirmed: false
    }
    onUpdate('featuredArtists', [...track.featuredArtists, newArtist])
  }

  const updateFeaturedArtist = (artistId: string, field: 'name' | 'isni' | 'confirmed', value: string | boolean) => {
    onUpdate('featuredArtists', track.featuredArtists.map(a =>
      a.id === artistId ? { ...a, [field]: value } : a
    ))
  }

  const removeFeaturedArtist = (artistId: string) => {
    onUpdate('featuredArtists', track.featuredArtists.filter(a => a.id !== artistId))
  }

  const addSessionArtist = () => {
    const newArtist = {
      id: crypto.randomUUID(),
      name: '',
      isni: '',
      roles: [],
      confirmed: false
    }
    onUpdate('sessionArtists', [...track.sessionArtists, newArtist])
  }

  const updateSessionArtist = (artistId: string, field: 'name' | 'isni' | 'roles' | 'confirmed', value: string | boolean | string[]) => {
    onUpdate('sessionArtists', track.sessionArtists.map(a =>
      a.id === artistId ? { ...a, [field]: value } : a
    ))
  }

  const removeSessionArtist = (artistId: string) => {
    onUpdate('sessionArtists', track.sessionArtists.filter(a => a.id !== artistId))
  }

  const addCreator = () => {
    const newCreator = {
      id: crypto.randomUUID(),
      name: '',
      isni: '',
      ipiCae: '',
      roles: [],
      confirmed: false
    }
    onUpdate('creators', [...track.creators, newCreator])
  }

  const updateCreator = (creatorId: string, field: 'name' | 'isni' | 'ipiCae' | 'roles' | 'confirmed', value: string | boolean | string[]) => {
    onUpdate('creators', track.creators.map(c =>
      c.id === creatorId ? { ...c, [field]: value } : c
    ))
  }

  const removeCreator = (creatorId: string) => {
    onUpdate('creators', track.creators.filter(c => c.id !== creatorId))
  }

  const addProducer = () => {
    const newProducer = {
      id: crypto.randomUUID(),
      name: '',
      isni: '',
      ipiCae: '',
      roles: [],
      confirmed: false
    }
    onUpdate('producers', [...track.producers, newProducer])
  }

  const updateProducer = (producerId: string, field: 'name' | 'isni' | 'ipiCae' | 'roles' | 'confirmed', value: string | boolean | string[]) => {
    onUpdate('producers', track.producers.map(p =>
      p.id === producerId ? { ...p, [field]: value } : p
    ))
  }

  const removeProducer = (producerId: string) => {
    onUpdate('producers', track.producers.filter(p => p.id !== producerId))
  }

  return (
    <div className="space-y-6">
      {/* Primary Artists */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Primary Artist(s)</h4>
          <Button type="button" size="sm" variant="outline" onClick={addPrimaryArtist}>
            <Plus className="w-4 h-4 mr-1" /> Add Primary Artist
          </Button>
        </div>
        {track.primaryArtists.length === 0 && (
          <p className="text-sm text-gray-500">No primary artists added yet</p>
        )}
        {track.primaryArtists.map((artist, idx) => (
          <div key={artist.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Primary Artist {idx + 1}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removePrimaryArtist(artist.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Registered Name</Label>
                <Input
                  value={artist.name}
                  onChange={(e) => updatePrimaryArtist(artist.id, 'name', e.target.value)}
                  placeholder="Artist name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Performer ISNI</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={artist.isni}
                    onChange={(e) => updatePrimaryArtist(artist.id, 'isni', e.target.value)}
                    placeholder="ISNI code"
                  />
                  <a
                    href="https://isni.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-800 whitespace-nowrap flex items-center"
                  >
                    Get ISNI
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={artist.confirmed}
                onChange={(e) => updatePrimaryArtist(artist.id, 'confirmed', e.target.checked)}
                className="w-4 h-4"
              />
              <Label className="text-xs cursor-pointer">Confirm Primary Artist {idx + 1}</Label>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Artists */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Featured Artist(s) (Optional)</h4>
          <Button type="button" size="sm" variant="outline" onClick={addFeaturedArtist}>
            <Plus className="w-4 h-4 mr-1" /> Add Featured Artist
          </Button>
        </div>
        {track.featuredArtists.length === 0 && (
          <p className="text-sm text-gray-500">No featured artists added yet</p>
        )}
        {track.featuredArtists.map((artist, idx) => (
          <div key={artist.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Featured Artist {idx + 1}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeFeaturedArtist(artist.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Registered Name</Label>
                <Input
                  value={artist.name}
                  onChange={(e) => updateFeaturedArtist(artist.id, 'name', e.target.value)}
                  placeholder="Artist name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Performer ISNI</Label>
                <Input
                  value={artist.isni}
                  onChange={(e) => updateFeaturedArtist(artist.id, 'isni', e.target.value)}
                  placeholder="ISNI code"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={artist.confirmed}
                onChange={(e) => updateFeaturedArtist(artist.id, 'confirmed', e.target.checked)}
                className="w-4 h-4"
              />
              <Label className="text-xs cursor-pointer">Confirm Featured Artist {idx + 1}</Label>
            </div>
          </div>
        ))}
      </div>

      {/* Session Artists */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Session Artist(s) (Optional)</h4>
          <Button type="button" size="sm" variant="outline" onClick={addSessionArtist}>
            <Plus className="w-4 h-4 mr-1" /> Add Session Artist
          </Button>
        </div>
        {track.sessionArtists.length === 0 && (
          <p className="text-sm text-gray-500">No session artists added yet</p>
        )}
        {track.sessionArtists.map((artist, idx) => (
          <div key={artist.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Session Artist {idx + 1}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeSessionArtist(artist.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs">Registered Name</Label>
                <Input
                  value={artist.name}
                  onChange={(e) => updateSessionArtist(artist.id, 'name', e.target.value)}
                  placeholder="Artist name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Performer ISNI</Label>
                <Input
                  value={artist.isni}
                  onChange={(e) => updateSessionArtist(artist.id, 'isni', e.target.value)}
                  placeholder="ISNI code"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mb-3">
              <Label className="text-xs">Role(s) <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {sessionArtistRoleOptions.map((role) => {
                  const isSelected = artist.roles.includes(role.value)
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => {
                        const newRoles = isSelected
                          ? artist.roles.filter(r => r !== role.value)
                          : [...artist.roles, role.value]
                        updateSessionArtist(artist.id, 'roles', newRoles)
                      }}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        isSelected
                          ? 'bg-purple-100 border-purple-500 text-purple-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {role.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={artist.confirmed}
                onChange={(e) => updateSessionArtist(artist.id, 'confirmed', e.target.checked)}
                className="w-4 h-4"
              />
              <Label className="text-xs cursor-pointer">Confirm Session Artist {idx + 1}</Label>
            </div>
          </div>
        ))}
      </div>

      {/* Creators (Songwriting Team) */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Songwriting Team (Creators)</h4>
          <Button type="button" size="sm" variant="outline" onClick={addCreator}>
            <Plus className="w-4 h-4 mr-1" /> Add Creator
          </Button>
        </div>
        {track.creators.length === 0 && (
          <p className="text-sm text-gray-500">No creators added yet</p>
        )}
        {track.creators.map((creator, idx) => (
          <div key={creator.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Creator {idx + 1}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeCreator(creator.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <Label className="text-xs">Registered Name</Label>
                <Input
                  value={creator.name}
                  onChange={(e) => updateCreator(creator.id, 'name', e.target.value)}
                  placeholder="Creator name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">ISNI</Label>
                <Input
                  value={creator.isni}
                  onChange={(e) => updateCreator(creator.id, 'isni', e.target.value)}
                  placeholder="ISNI code"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">IPI/CAE</Label>
                <Input
                  value={creator.ipiCae}
                  onChange={(e) => updateCreator(creator.id, 'ipiCae', e.target.value)}
                  placeholder="IPI/CAE code"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mb-3">
              <Label className="text-xs">Role(s) <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {creatorRoleOptions.map((role) => {
                  const isSelected = creator.roles.includes(role.value)
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => {
                        const newRoles = isSelected
                          ? creator.roles.filter(r => r !== role.value)
                          : [...creator.roles, role.value]
                        updateCreator(creator.id, 'roles', newRoles)
                      }}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        isSelected
                          ? 'bg-purple-100 border-purple-500 text-purple-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {role.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={creator.confirmed}
                onChange={(e) => updateCreator(creator.id, 'confirmed', e.target.checked)}
                className="w-4 h-4"
              />
              <Label className="text-xs cursor-pointer">Confirm Creator {idx + 1}</Label>
            </div>
          </div>
        ))}
      </div>

      {/* Producers */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Production Team</h4>
          <Button type="button" size="sm" variant="outline" onClick={addProducer}>
            <Plus className="w-4 h-4 mr-1" /> Add Producer
          </Button>
        </div>
        {track.producers.length === 0 && (
          <p className="text-sm text-gray-500">No producers added yet</p>
        )}
        {track.producers.map((producer, idx) => (
          <div key={producer.id} className="border border-gray-100 rounded-lg p-3 mb-3 bg-gray-50">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Producer {idx + 1}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeProducer(producer.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <Label className="text-xs">Registered Name</Label>
                <Input
                  value={producer.name}
                  onChange={(e) => updateProducer(producer.id, 'name', e.target.value)}
                  placeholder="Producer name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">ISNI</Label>
                <Input
                  value={producer.isni}
                  onChange={(e) => updateProducer(producer.id, 'isni', e.target.value)}
                  placeholder="ISNI code"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">IPI/CAE (Optional)</Label>
                <Input
                  value={producer.ipiCae}
                  onChange={(e) => updateProducer(producer.id, 'ipiCae', e.target.value)}
                  placeholder="IPI/CAE code"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mb-3">
              <Label className="text-xs">Role(s) <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {producerRoleOptions.map((role) => {
                  const isSelected = producer.roles.includes(role.value)
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => {
                        const newRoles = isSelected
                          ? producer.roles.filter(r => r !== role.value)
                          : [...producer.roles, role.value]
                        updateProducer(producer.id, 'roles', newRoles)
                      }}
                      className={`px-3 py-1 text-xs rounded-full border ${
                        isSelected
                          ? 'bg-purple-100 border-purple-500 text-purple-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {role.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={producer.confirmed}
                onChange={(e) => updateProducer(producer.id, 'confirmed', e.target.checked)}
                className="w-4 h-4"
              />
              <Label className="text-xs cursor-pointer">Confirm Producer {idx + 1}</Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
