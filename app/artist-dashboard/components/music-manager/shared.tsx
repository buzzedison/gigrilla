'use client'

import { Info, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'

// InfoBox component for displaying contextual information
interface InfoBoxProps {
  title: string
  children: React.ReactNode
  variant?: 'info' | 'warning' | 'success'
}

export function InfoBox({ title, children, variant = 'info' }: InfoBoxProps) {
  const variants = {
    info: {
      bg: 'bg-purple-50 border-purple-200',
      icon: <Info className="w-5 h-5 text-purple-500" />,
      titleColor: 'text-purple-800'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      titleColor: 'text-amber-800'
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      titleColor: 'text-emerald-800'
    }
  }

  const style = variants[variant]

  return (
    <div className={`${style.bg} border rounded-lg p-4 mt-4`}>
      <div className="flex items-start gap-3">
        {style.icon}
        <div className="flex-1">
          <h4 className={`font-semibold ${style.titleColor} mb-1 font-ui`}>{title}</h4>
          <div className="text-sm text-gray-700">{children}</div>
        </div>
      </div>
    </div>
  )
}

// IdCodeCard component for displaying music industry ID information
interface IdCodeCardProps {
  title: string
  description: string
  learnMoreUrl: string
  examples?: string[]
}

export function IdCodeCard({ title, description, learnMoreUrl, examples }: IdCodeCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-4 hover:shadow-md transition-shadow">
      <h5 className="font-semibold text-gray-800 mb-2 font-ui">{title}</h5>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      {examples && examples.length > 0 && (
        <div className="mb-3 bg-white/60 rounded-md px-2 py-1 inline-block">
          <span className="text-xs text-gray-500">Example: </span>
          <code className="text-xs text-purple-700 font-mono">{examples.join(', ')}</code>
        </div>
      )}
      <a
        href={learnMoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium"
      >
        Learn more <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}

// Section wrapper component
interface SectionWrapperProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function SectionWrapper({ title, subtitle, children }: SectionWrapperProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="mb-5 pb-4 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 font-heading">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1 font-ui">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
