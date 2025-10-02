"use client";

import { useEffect, useMemo, useState, useRef } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Save, Trash2, Loader2, RefreshCcw, Mail } from "lucide-react"

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
  roles?: string[] | null
  status: "pending" | "sent" | "accepted" | "declined" | "revoked" | "active"
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
  roles: string[]
  incomeShare: number | ""
  displayAge: boolean
}

interface ActiveMember {
  id: string
  invitation_id: string | null
  name: string | null
  email: string
  roles?: string[] | null
  metadata?: MemberMetadata | null
  joined_at: string
}

type ArtistMembersResponse = {
  invitations?: ArtistMemberInvitation[]
  data?: ArtistMemberInvitation[]
  activeMembers?: ActiveMember[]
  active?: ActiveMember[]
  artistProfileId?: string | null
  primaryRoles?: string[] | null
}

const statusStyles: Record<ArtistMemberInvitation["status"], { label: string; className: string }> = {
  pending: { label: "Pending Invite", className: "bg-amber-50 text-amber-700 border-amber-200" },
  sent: { label: "Invitation Sent", className: "bg-blue-50 text-blue-700 border-blue-200" },
  accepted: { label: "Accepted", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  declined: { label: "Declined", className: "bg-rose-50 text-rose-700 border-rose-200" },
  revoked: { label: "Revoked", className: "bg-gray-100 text-gray-600 border-gray-200" },
  active: { label: "Active", className: "bg-purple-50 text-purple-700 border-purple-200" }
}

const deriveActiveDisplayName = (member: ActiveMember) => {
  if (member.name) return member.name
  const metadata = (member.metadata ?? {}) as MemberMetadata
  const parts = [metadata.firstName, metadata.nickname ? `"${metadata.nickname}"` : '', metadata.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  return parts || member.email
}

const ROLE_OPTIONS = [
  "Lead Singer",
  "Keyboardist",
  "Drummer",
  "Guitarist",
  "Bassist",
  "Backing Vocalist",
  "Manager",
  "Producer"
]

export function ArtistMembersManager() {
  const [members, setMembers] = useState<ArtistMemberInvitation[]>([])
  const [activeMembers, setActiveMembers] = useState<ActiveMember[]>([])
  const activeListRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [primaryRoles, setPrimaryRoles] = useState<string[]>([])
  const [publishing, setPublishing] = useState(false)
  const [draft, setDraft] = useState<NewMemberDraft>({
    firstName: "",
    nickname: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    role: "",
    roles: [],
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
      const result: ArtistMembersResponse = await response.json()
      const invitationData = result.invitations ?? result.data ?? []
      setMembers(invitationData)
      setActiveMembers(result.activeMembers ?? result.active ?? [])
      if (Array.isArray(result.primaryRoles)) {
        setPrimaryRoles(result.primaryRoles)
      }
    } catch (error) {
      console.error('ArtistMembersManager: loadMembers error', error)
      setFeedback({ type: 'error', message: 'Unable to load existing member invitations right now.' })
      setMembers([])
      setActiveMembers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDraftChange = (field: keyof NewMemberDraft, value: string | number | boolean | string[]) => {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  const togglePrimaryRole = (role: string) => {
    setPrimaryRoles(prev =>
      prev.includes(role) ? prev.filter(item => item !== role) : [...prev, role]
    )
  }

  const resetDraft = () => {
    setDraft({
      firstName: "",
      nickname: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      role: "",
      roles: [],
      incomeShare: "",
      displayAge: true
    })
  }

  const handleSendInvitation = async () => {
    if (!draft.email || (!draft.role && draft.roles.length === 0)) {
      setFeedback({ type: 'error', message: 'Email and at least one role are required to send an invitation.' })
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
          roles: draft.roles,
          dateOfBirth: draft.dateOfBirth || null,
          incomeShare: draft.incomeShare === "" ? null : draft.incomeShare,
          displayAge: draft.displayAge
        })
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error ?? 'Invitation failed')
      }

      const newInvite = result.data as ArtistMemberInvitation
      setMembers(prev => [newInvite, ...prev])
      setFeedback({
        type: 'success',
        message: typeof result.message === 'string' && result.message.trim().length > 0
          ? result.message
          : `Invitation sent to ${draft.email}.`
      })
      resetDraft()
    } catch (error) {
      console.error('ArtistMembersManager: send invitation error', error)
      const fallbackMessage = error instanceof Error && error.message ? error.message : null
      setFeedback({
        type: 'error',
        message: fallbackMessage ?? 'Could not send invitation. Please try again.'
      })
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

  const acceptedInvites = useMemo(
    () => members.filter(member => member.status === 'accepted'),
    [members]
  )

  const isDraftValid = useMemo(() => {
    return Boolean(draft.email.trim() && (draft.roles.length > 0 || draft.role.trim()))
  }, [draft.email, draft.role, draft.roles])

  const hasPublishableInvites = acceptedInvites.length > 0

  const handlePublishMembers = async () => {
    if (!hasPublishableInvites || publishing) return

    setPublishing(true)
    try {
      const response = await fetch('/api/artist-members/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ invitationIds: acceptedInvites.map(invite => invite.id) })
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error ?? 'Publish failed')
      }

      setFeedback({ type: 'success', message: 'Artist members published.' })
      await loadMembers()

      if (acceptedInvites.length > 0 && activeListRef.current) {
        activeListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } catch (error) {
      console.error('ArtistMembersManager: publish members error', error)
      setFeedback({ type: 'error', message: 'Unable to publish members right now. Please try again.' })
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
        <header className="border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Invite Artist Members</h2>
          <p className="text-sm text-gray-500 mt-1">Control who can collaborate on your artist profile and receive invite status updates.</p>
        </header>

        {feedback && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Step 1 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">Step 1</p>
              <h3 className="text-lg font-medium text-gray-900">Select Your Artist Role</h3>
              <p className="text-sm text-gray-500">Tell us how you primarily contribute so we can tailor invite permissions.</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadMembers} disabled={loading}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh Invites
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Primary Roles</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {ROLE_OPTIONS.map(option => {
                const selected = primaryRoles.includes(option)
                return (
                  <Button
                    key={option}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    className={selected ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-gray-200"}
                    onClick={() => togglePrimaryRole(option)}
                  >
                    {option}
                  </Button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500">
              {primaryRoles.length === 0
                ? 'Select all roles that describe you or your project.'
                : `Currently selected: ${primaryRoles.join(', ')}`}
            </p>
          </div>
        </section>

        {/* Step 2 */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">Step 2</p>
            <h3 className="text-lg font-medium text-gray-900">Invite Artist Members</h3>
            <p className="text-sm text-gray-500">Add their details and we’ll send the invite automatically once you click send.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member Roles</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map(option => {
                  const selected = draft.roles.includes(option)
                  return (
                    <Button
                      key={option}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      className={selected ? "bg-purple-600 hover:bg-purple-700 text-white" : "border-gray-200"}
                      onClick={() => {
                        handleDraftChange('roles', selected ? draft.roles.filter(r => r !== option) : [...draft.roles, option])
                      }}
                    >
                      {option}
                    </Button>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {draft.roles.length === 0
                  ? 'Add at least one role for this member invitation.'
                  : `Selected: ${draft.roles.join(', ')}`}
              </p>
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth (Optional)</label>
              <Input
                type="date"
                value={draft.dateOfBirth}
                onChange={(e) => handleDraftChange('dateOfBirth', e.target.value)}
              />
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
              Send Invite & Save
            </Button>
            <Button
              variant="ghost"
              onClick={resetDraft}
              disabled={submitting}
            >
              Clear
            </Button>
          </div>
        </section>

        {/* Step 3 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">Step 3</p>
              <h3 className="text-lg font-medium text-gray-900">Artist Member Invite Progress</h3>
              <p className="text-sm text-gray-500">Track the status of every invite and follow up with your team.</p>
            </div>
            <span className="text-xs text-gray-500">{members.length} total invites</span>
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

                const rolesToShow = Array.isArray(member.roles) && member.roles.length > 0
                  ? member.roles
                  : member.role
                    ? [member.role]
                    : []

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
                        {rolesToShow.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Roles: <span className="font-medium">{rolesToShow.join(', ')}</span>
                          </p>
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
        </section>

        {/* Step 4 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">Step 4</p>
              <h3 className="text-lg font-medium text-gray-900">Active Artist Members</h3>
              <p className="text-sm text-gray-500">This section will show the members who have accepted and are active on your team.</p>
            </div>
            <Button variant="outline" className="px-4" onClick={loadMembers} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          </div>
          {activeMembers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center text-sm text-gray-500">
              Active members will appear here once invites are accepted.
            </div>
          ) : (
            <div ref={activeListRef} className="space-y-4">
              {activeMembers.map(member => {
                const rolesToShow = Array.isArray(member.roles) && member.roles.length > 0 ? member.roles : []
                const displayName = deriveActiveDisplayName(member)
                const metadata = (member.metadata ?? {}) as MemberMetadata
                const dob = metadata.dateOfBirth ?? null
                const age = getAge(dob)
                const displayAge = metadata.displayAge ?? false

                return (
                  <div key={member.id} className="border border-purple-200 bg-purple-50/40 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">{displayName}</h4>
                          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{member.email}</p>
                        {rolesToShow.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Roles: <span className="font-medium">{rolesToShow.join(', ')}</span>
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">Joined {new Date(member.joined_at).toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
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
                      {metadata.incomeShare && (
                        <div>
                          <span className="text-gray-600">Income Share:</span>
                          <span className="font-medium ml-2">{metadata.incomeShare}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="outline" className="px-8" onClick={loadMembers} disabled={loading}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
        <Button
          variant="outline"
          className="px-8"
          onClick={handlePublishMembers}
          disabled={publishing || !hasPublishableInvites}
          title={!hasPublishableInvites ? 'No accepted invitations to publish yet' : undefined}
        >
          {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Publish Members
        </Button>
      </div>
    </div>
  )
}
