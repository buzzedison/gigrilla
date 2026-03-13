'use client'

import { useState } from 'react'
import { X, ExternalLink, Search, Disc3, FileAudio } from 'lucide-react'
import { Button } from '../../../components/ui/button'

type Tab = 'get' | 'find'

interface ISRCInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ISRCInfoModal({ isOpen, onClose }: ISRCInfoModalProps) {
  const [tab, setTab] = useState<Tab>('get')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-3xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Close ISRC helper">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Disc3 className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Get / Find an ISRC</h2>
              <p className="text-purple-100 text-sm mt-1">International Standard Recording Code</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button type="button" onClick={() => setTab('get')} className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'get' ? 'bg-purple-600 text-white' : 'bg-muted text-foreground/70 hover:bg-muted/80'}`}>
              Get an ISRC
            </button>
            <button type="button" onClick={() => setTab('find')} className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'find' ? 'bg-purple-600 text-white' : 'bg-muted text-foreground/70 hover:bg-muted/80'}`}>
              Find Your ISRC
            </button>
          </div>

          {tab === 'get' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
                <p className="text-sm text-purple-900 font-medium mb-1">What is an ISRC?</p>
                <p className="text-xs text-purple-800">
                  An ISRC identifies a specific sound recording. Every distinct recording version needs its own code.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">Get it from your ISRC manager or distributor</p>
                <p className="text-sm text-gray-700 mb-3">
                  If your label, distributor, or national ISRC agency manages your releases, they normally issue the code.
                </p>
                <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white" size="sm">
                  <a href="https://usisrc.org/" target="_blank" rel="noopener noreferrer">
                    Visit the ISRC Registry <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          {tab === 'find' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-900 font-medium mb-1">Already released this recording?</p>
                <p className="text-xs text-blue-800">
                  The ISRC is usually already stored in the system that delivered the recording.
                </p>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 p-4 flex gap-3">
                  <FileAudio className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Check your distributor, label, or mastering delivery sheet</p>
                    <p className="text-sm text-gray-700">ISRCs are commonly listed in release dashboards, delivery reports, and mastering metadata sheets.</p>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 flex gap-3">
                  <Search className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Use your existing registered code here</p>
                    <p className="text-sm text-gray-700">Paste the code into the field above and Gigrilla will verify the format and try to pull through metadata.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-3xl border-t">
          <Button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-700">Close Helper</Button>
        </div>
      </div>
    </div>
  )
}
