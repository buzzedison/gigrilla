"use client";

import { useEffect, useMemo, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { Save, Plus, Edit2, Trash2, Loader2, RefreshCcw, Mail } from "lucide-react"

interface MemberMetadata {
  firstName?: string
  nickname?: string
  lastName?: string
  dateOfBirth?: string
  incomeShare?: number
  displayAge?: boolean
}

interface ArtistMemberInvitation {
  id: string
  name: string | null
  email: string
  role: string | null
  status: "pending" | "sent" | "accepted" | "declined" | "revoked"
  invited_at: string
  responded_at: string | null
  metadata?: MemberMetadata | null
}

interface NewMemberDraft {
  firstName: string
  nickname: string
  lastName: string
  email: string
  dateOfBirth: string
  role: string
  incomeShare: number | ""
  displayAge: boolean
}

const statusStyles: Record<ArtistMemberInvitation["status"], { label: string; className: string }> = {
  pending: { label: "Pending Invite", className: "bg-amber-50 text-amber-700 border-amber-200" },
  sent: { label: "Invitation Sent", className: "bg-blue-50 text-blue-700 border-blue-200" },
  accepted: { label: "Accepted", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  declined: { label: "Declined", className: "bg-rose-50 text-rose-700 border-rose-200" },
  revoked: { label: "Revoked", className: "bg-gray-100 text-gray-600 border-gray-200" }
}

export function ArtistMembersManager() {
  const [members, setMembers] = useState<ArtistMemberInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [draft, setDraft] = useState<NewMemberDraft>({
    firstName: "",
    nickname: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    role: "",
    incomeShare: "",
    displayAge: true
  })

  useEffect(() => {
    loadMembers()
  }, [])

  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), 4000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/artist-members')
      if (!response.ok) {
        throw new Error('Failed to fetch artist members')
      }
      const result = await response.json()
      setMembers(result.data ?? [])
    } catch (error) {
      console.error('ArtistMembersManager: loadMembers error', error)
      setFeedback({ type: 'error', message: 'Unable to load existing member invitations right now.' })
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDraftChange = (field: keyof NewMemberDraft, value: string | number | boolean) => {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  const resetDraft = () => {
    setDraft({
      firstName: "",
      nickname: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      role: "",
      incomeShare: "",
      displayAge: true
    })
  }

  const handleSendInvitation = async () => {
    if (!draft.email || !draft.role) {
      setFeedback({ type: 'error', message: 'Email and role are required to send an invitation.' })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/artist-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: draft.firstName,
          nickname: draft.nickname,
          lastName: draft.lastName,
          email: draft.email,
          role: draft.role,
          dateOfBirth: draft.dateOfBirth || null,
          incomeShare: draft.incomeShare === "" ? null : draft.incomeShare,
          displayAge: draft.displayAge
        })
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error ?? 'Invitation failed')
      }

      setMembers(prev => [result.data, ...prev])
      setFeedback({ type: 'success', message: `Invitation queued for ${draft.email}.` })
      resetDraft()
    } catch (error) {
      console.error('ArtistMembersManager: send invitation error', error)
      setFeedback({ type: 'error', message: 'Could not send invitation. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const previousMembers = members
    setMembers(prev => prev.filter(member => member.id !== id))
    try {
      const response = await fetch('/api/artist-members', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })

      if (!response.ok) {
        throw new Error('Failed to delete member invitation')
      }
      setFeedback({ type: 'success', message: 'Invitation removed.' })
    } catch (error) {
      console.error('ArtistMembersManager: delete invitation error', error)
      setFeedback({ type: 'error', message: 'Unable to remove the invitation right now.' })
      setMembers(previousMembers)
    }
  }

  const deriveDisplayName = (member: ArtistMemberInvitation) => {
    const metadata = (member.metadata ?? {}) as MemberMetadata
    if (member.name) return member.name

    const parts = [metadata.firstName, metadata.nickname ? `"${metadata.nickname}"` : '', metadata.lastName]
      .filter(Boolean)
      .join(' ')
      .trim()

    return parts || member.email
  }

  const deriveIncomeShare = (member: ArtistMemberInvitation) => {
    const metadata = (member.metadata ?? {}) as MemberMetadata
    if (metadata.incomeShare !== undefined) return metadata.incomeShare
    return null
  }

  const deriveDateOfBirth = (member: ArtistMemberInvitation) => {
    const metadata = (member.metadata ?? {}) as MemberMetadata
    return metadata.dateOfBirth ?? null
  }

  const shouldDisplayAge = (member: ArtistMemberInvitation) => {
    const metadata = (member.metadata ?? {}) as MemberMetadata
    return metadata.displayAge ?? false
  }

  const getAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  const isDraftValid = useMemo(() => {
    return Boolean(draft.email.trim() && draft.role.trim())
  }, [draft.email, draft.role])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Invite Artist Members</h2>
            <p className="text-sm text-gray-500 mt-1">Send collaboration invitations to your bandmates or team. They’ll receive an email with next steps.</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadMembers} disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {feedback && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <Input
              value={draft.firstName}
              onChange={(e) => handleDraftChange('firstName', e.target.value)}
              placeholder="First Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <Input
              value={draft.lastName}
              onChange={(e) => handleDraftChange('lastName', e.target.value)}
              placeholder="Last Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nickname (Optional)</label>
            <Input
              value={draft.nickname}
              onChange={(e) => handleDraftChange('nickname', e.target.value)}
              placeholder="Nickname"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => handleDraftChange('email', e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select value={draft.role} onValueChange={(value) => handleDraftChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead Singer">Lead Singer</SelectItem>
                <SelectItem value="Keyboardist">Keyboardist</SelectItem>
                <SelectItem value="Drummer">Drummer</SelectItem>
                <SelectItem value="Guitarist">Guitarist</SelectItem>
                <SelectItem value="Bassist">Bassist</SelectItem>
                <SelectItem value="Backing Vocalist">Backing Vocalist</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Producer">Producer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (Optional)</label>
            <Input
              type="date"
              value={draft.dateOfBirth}
              onChange={(e) => handleDraftChange('dateOfBirth', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Share of Income (Optional)</label>
            <div className="relative">
              <Input
                type="number"
                value={draft.incomeShare}
                min={0}
                max={100}
                step={0.1}
                onChange={(e) => {
                  const value = e.target.value
                  handleDraftChange('incomeShare', value === '' ? '' : parseFloat(value))
                }}
                placeholder="e.g. 25"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">You can fine-tune splits per project later.</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="displayAge"
              checked={draft.displayAge}
              onChange={(e) => handleDraftChange('displayAge', e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="displayAge" className="text-sm text-gray-700">Display age on member profile</label>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={handleSendInvitation}
            disabled={!isDraftValid || submitting}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
            Send Invitation
          </Button>
          <Button
            variant="ghost"
            onClick={resetDraft}
            disabled={submitting}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Team Invitations</h3>
          <span className="text-xs text-gray-500">{members.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2 text-purple-500" />
            Loading member invitations…
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center text-sm text-gray-500">
            No invitations yet. Add a member above to send the first invite.
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => {
              const displayName = deriveDisplayName(member)
              const incomeShare = deriveIncomeShare(member)
              const dob = deriveDateOfBirth(member)
              const age = getAge(dob)
              const displayAge = shouldDisplayAge(member)
              const statusStyle = statusStyles[member.status]

              return (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-gray-900">{displayName}</h4>
                        <Badge variant="outline" className={statusStyle.className}>
                          {statusStyle.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{member.email}</p>
                      {member.role && (
                        <p className="text-sm text-gray-600 mt-1">Role: <span className="font-medium">{member.role}</span></p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
                        disabled={submitting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
                    <div>
                      <span className="text-gray-600">Invited:</span>
                      <span className="font-medium ml-2">{new Date(member.invited_at).toLocaleString()}</span>
                    </div>
                    {dob && (
                      <div>
                        <span className="text-gray-600">Date of Birth:</span>
                        <span className="font-medium ml-2">{new Date(dob).toLocaleDateString()}</span>
                        {displayAge && age !== null && (
                          <span className="text-gray-500 ml-2">(Age {age})</span>
                        )}
                        {!displayAge && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Do not display age
                          </Badge>
                        )}
                      </div>
                    )}
                    {incomeShare !== null && (
                      <div>
                        <span className="text-gray-600">Income Share:</span>
                        <span className="font-medium ml-2">{incomeShare}%</span>
                      </div>
                    )}
                  </div>

                  {member.responded_at && (
                    <p className="text-xs text-gray-500 mt-3">
                      Responded {new Date(member.responded_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" className="px-8" onClick={loadMembers} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8" disabled>
          Publish Members
        </Button>
      </div>
    </div>
  )
}
