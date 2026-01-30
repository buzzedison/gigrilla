'use client'

import { X, Send, Building2, Users, Truck, Music2, Shield, CheckCircle } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'

interface InvitationModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'label' | 'publisher' | 'distributor' | 'pro' | 'mcs'
  onSubmit: (data: InvitationData) => void
  initialData?: {
    name?: string
    email?: string
    contactName?: string
  }
}

export interface InvitationData {
  type: string
  name: string
  email: string
  message: string
}

const modalConfig = {
  label: {
    title: 'Invite Record Label',
    description: 'Invite your record label to collaborate on this release and manage master rights.',
    icon: Building2,
    color: 'purple'
  },
  publisher: {
    title: 'Invite Publisher',
    description: 'Invite your music publisher to manage publishing rights and royalty collection.',
    icon: Users,
    color: 'blue'
  },
  distributor: {
    title: 'Invite Distributor',
    description: 'Invite your distributor to handle digital distribution and master royalty collection.',
    icon: Truck,
    color: 'green'
  },
  pro: {
    title: 'Invite PRO',
    description: 'Connect with your Performing Rights Organization for performance royalty collection.',
    icon: Shield,
    color: 'indigo'
  },
  mcs: {
    title: 'Invite MCS',
    description: 'Connect with your Mechanical Collection Society for mechanical royalty collection.',
    icon: Music2,
    color: 'amber'
  }
}

export function InvitationModal({ isOpen, onClose, type, onSubmit, initialData }: InvitationModalProps) {
  const config = modalConfig[type]
  const Icon = config.icon

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onSubmit({
      type,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${config.color}-600`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
            <p className="text-sm text-gray-500">{config.description}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              type="text"
              required
              defaultValue={initialData?.name || ''}
              placeholder={`Enter ${type} name`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email <span className="text-red-500">*</span>
            </label>
            <Input
              name="email"
              type="email"
              required
              defaultValue={initialData?.email || ''}
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-gray-400">(optional)</span>
            </label>
            <Textarea
              name="message"
              rows={3}
              placeholder="Add a personal message to your invitation..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Send className="w-4 h-4 mr-2" /> Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Error Report Modal
interface ErrorReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ErrorReportData) => void
}

export interface ErrorReportData {
  field: string
  description: string
  expectedValue: string
}

export function ErrorReportModal({ isOpen, onClose, onSubmit }: ErrorReportModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    onSubmit({
      field: formData.get('field') as string,
      description: formData.get('description') as string,
      expectedValue: formData.get('expectedValue') as string
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Report an Error</h3>
          <p className="text-sm text-gray-500">
            Let us know if there&apos;s incorrect information that needs to be corrected.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Which field has an error? <span className="text-red-500">*</span>
            </label>
            <select
              name="field"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select a field</option>
              <option value="gtin">GTIN / UPC / EAN</option>
              <option value="releaseTitle">Release Title</option>
              <option value="releaseType">Release Type</option>
              <option value="trackCount">Track Count</option>
              <option value="territory">Territory Information</option>
              <option value="goLiveDate">Go-Live Date</option>
              <option value="masterRights">Master Rights</option>
              <option value="publishingRights">Publishing Rights</option>
              <option value="royalties">Royalty Information</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe the error <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="description"
              required
              rows={3}
              placeholder="What's wrong with the current information?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What should it be? <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="expectedValue"
              required
              rows={2}
              placeholder="Enter the correct information"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600">
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Success Confirmation Modal
interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  organizationName: string
  contactEmail: string
  type: 'label' | 'publisher' | 'distributor' | 'pro' | 'mcs'
}

export function SuccessModal({ isOpen, onClose, organizationName, contactEmail, type }: SuccessModalProps) {
  const config = modalConfig[type]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* Success Icon */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Invitation Sent Successfully!</h3>
          <p className="text-gray-600">
            Your invitation to <strong>{organizationName}</strong> has been sent to{' '}
            <strong className="text-gray-900">{contactEmail}</strong>
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            The {config.title.toLowerCase()} will receive an email with details about your release
            and instructions on how to accept the collaboration invitation.
          </p>
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          className="w-full"
        >
          Done
        </Button>
      </div>
    </div>
  )
}
