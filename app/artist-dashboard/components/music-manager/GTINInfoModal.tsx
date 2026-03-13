'use client'

import { useState } from 'react'
import { X, ExternalLink, Search, ShoppingCart, Package, Music4 } from 'lucide-react'
import { Button } from '../../../components/ui/button'

type Tab = 'get' | 'find'

interface GTINInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GTINInfoModal({ isOpen, onClose }: GTINInfoModalProps) {
  const [tab, setTab] = useState<Tab>('get')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-3xl">
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
              <h2 className="text-2xl font-bold">Get / Find a GTIN</h2>
              <p className="text-purple-100 text-sm mt-1">
                Global Trade Item Number for this specific release
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setTab('get')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'get' ? 'bg-purple-600 text-white' : 'bg-muted text-foreground/70 hover:bg-muted/80'
              }`}
            >
              Get a GTIN
            </button>
            <button
              type="button"
              onClick={() => setTab('find')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                tab === 'find' ? 'bg-purple-600 text-white' : 'bg-muted text-foreground/70 hover:bg-muted/80'
              }`}
            >
              Find Your GTIN
            </button>
          </div>

          {tab === 'get' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
                <p className="text-sm text-purple-900 font-medium mb-1">What is a GTIN?</p>
                <p className="text-xs text-purple-800">
                  A GTIN is the product code for the release itself. In music this is usually a UPC (12 digits)
                  or EAN (13 digits). You only need one type for a specific release.
                </p>
              </div>

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
                    GS1 is the official standards body behind GTINs. Use this route if you want to manage your own codes.
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
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <p className="text-sm text-blue-900 font-medium mb-1">Already assigned a GTIN?</p>
                <p className="text-xs text-blue-800">
                  Find it in the system that issued it, then enter it here and confirm it before proceeding.
                </p>
              </div>

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
                    attempt to pull through registered release details.
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
