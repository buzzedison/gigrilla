'use client'

import { useEffect, useState } from 'react'
import { X, ExternalLink, Search, ShoppingCart, Package, Music4 } from 'lucide-react'
import { Button } from '../../../components/ui/button'

export type GTINInfoTab = 'get' | 'find'

interface GTINInfoModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: GTINInfoTab
}

export function GTINInfoModal({ isOpen, onClose, initialTab = 'get' }: GTINInfoModalProps) {
  const [tab, setTab] = useState<GTINInfoTab>(initialTab)

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab)
    }
  }, [initialTab, isOpen])

  if (!isOpen) return null

  const headerTitle = tab === 'get' ? 'Get a GTIN' : 'Find a GTIN'
  const headerSubtitle =
    tab === 'get'
      ? 'Use this tab if you need to obtain a new GTIN for this release'
      : 'Use this tab if a GTIN already exists and you need to locate it'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-3xl space-y-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close GTIN helper"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">{headerTitle}</h2>
              <p className="text-purple-100 text-sm mt-1">{headerSubtitle}</p>
            </div>
          </div>
          <div className="inline-flex rounded-2xl bg-white/10 p-1.5 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setTab('get')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                tab === 'get' ? 'bg-white text-purple-800 shadow-sm' : 'text-purple-100 hover:bg-white/10'
              }`}
            >
              Get
            </button>
            <button
              type="button"
              onClick={() => setTab('find')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                tab === 'find' ? 'bg-white text-purple-800 shadow-sm' : 'text-purple-100 hover:bg-white/10'
              }`}
            >
              Find
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
            <p className="text-sm font-medium text-purple-900">
              {tab === 'get' ? 'Need a new GTIN?' : 'Already have one somewhere?'}
            </p>
            <p className="mt-1 text-sm text-purple-800">
              {tab === 'get'
                ? 'A GTIN is the product code for the release itself. In music this is usually a UPC (12 digits) or EAN (13 digits).'
                : 'Use the find tab to locate an existing UPC or EAN before you paste it back into the release form.'}
            </p>
          </div>

          {tab === 'get' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Recommended: get it from your distributor</p>
                  <p className="text-sm text-gray-700">
                    Most distributors and aggregators provide a GTIN as part of release setup. That is usually the
                    simplest route for independent artists.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">Alternative: buy one from GS1</p>
                  <p className="text-sm text-gray-700">
                    GS1 is the official standards body behind GTINs. Use this route if you want to manage your own codes directly.
                  </p>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white" size="sm">
                    <a href="https://www.gs1.org/" target="_blank" rel="noopener noreferrer">
                      Visit GS1 <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tab === 'find' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 p-4 flex gap-3">
                  <Music4 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Check your distributor dashboard</p>
                    <p className="text-sm text-gray-700">
                      If DistroKid, CD Baby, TuneCore, AWAL or another distributor created the release, the UPC/EAN is
                      typically shown on the release details page.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 flex gap-3">
                  <Search className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Check release paperwork or metadata exports</p>
                    <p className="text-sm text-gray-700">
                      Existing delivery reports, barcode sheets, distributor exports, and release metadata packs usually
                      include the GTIN.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-700">
                    Once you have the UPC or EAN, paste it into the field above. Gigrilla will validate the format and
                    try to pull through registered release details.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-3xl border-t">
          <Button onClick={onClose} className="w-full bg-purple-600 hover:bg-purple-700">
            Close Helper
          </Button>
        </div>
      </div>
    </div>
  )
}
