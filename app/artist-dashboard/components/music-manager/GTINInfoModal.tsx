'use client'

import { X, HelpCircle, DollarSign, Music, ShoppingCart, CheckCircle2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'

interface GTINInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GTINInfoModal({ isOpen, onClose }: GTINInfoModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <HelpCircle className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">What is a GTIN?</h2>
              <p className="text-purple-100 text-sm mt-1">
                Everything you need to know about Global Trade Item Numbers
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
            <p className="text-gray-700 leading-relaxed">
              A <strong>GTIN (Global Trade Item Number)</strong> is a unique identifier for your music release.
              The two most common types are:
            </p>
            <ul className="mt-3 space-y-2">
              <li className="flex gap-2 text-gray-700">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>UPC (12 digits)</strong> - Primarily used in the USA and Canada</span>
              </li>
              <li className="flex gap-2 text-gray-700">
                <span className="text-purple-600 font-bold">•</span>
                <span><strong>EAN (13 digits)</strong> - Used internationally, especially in Europe</span>
              </li>
            </ul>
            <p className="mt-3 text-gray-700">
              You only need <strong>one</strong> of these codes, not both. They ensure your music is properly
              tracked across all platforms, stores, and royalty collection systems.
            </p>
          </section>

          {/* Why You Need It */}
          <section className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Do I Need a GTIN?</h3>
            <div className="space-y-3">
              <div className="flex gap-3 items-start bg-purple-50 p-4 rounded-xl">
                <Music className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Distribution Requirement</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Most digital platforms (Spotify, Apple Music, Amazon Music) require a GTIN to accept your release.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-green-50 p-4 rounded-xl">
                <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Accurate Royalty Tracking</p>
                  <p className="text-sm text-gray-700 mt-1">
                    GTINs ensure sales and streams are correctly attributed to your release, so you get paid properly.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-blue-50 p-4 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Professional Standards</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Having proper GTINs demonstrates professionalism and helps with chart eligibility.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How to Get One */}
          <section className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Get a GTIN</h3>

            {/* Option 1 */}
            <div className="mb-4 border border-purple-200 rounded-2xl p-5 bg-purple-50/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Through Your Distributor (Recommended)</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Most music distributors provide GTINs for FREE as part of their service. This is the easiest option for independent artists.
                  </p>
                  <div className="bg-white rounded-xl p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Popular distributors that provide GTINs:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span><strong>DistroKid</strong> - Included with subscription</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span><strong>CD Baby</strong> - Provided with each release</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span><strong>TuneCore</strong> - Included with distribution</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span><strong>AWAL, Ditto, Amuse</strong> - And many others</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2 */}
            <div className="mb-4 border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Purchase Directly from GS1</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    GS1 is the official global organization that manages GTINs. Purchase your own codes if you want full control.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Initial fee (USA):</span>
                        <span className="font-semibold text-gray-900">$30 + $50/year</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Includes:</span>
                        <span className="font-semibold text-gray-900">10 GTINs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Additional codes:</span>
                        <span className="font-semibold text-gray-900">$0.90 each</span>
                      </div>
                    </div>
                    <a
                      href="https://www.gs1us.org/get-started"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Visit GS1 US
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Prices vary by country. Visit your local GS1 organization for specific pricing.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 3 */}
            <div className="border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Through Third-Party Services</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    Some services sell individual GTINs without ongoing fees:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">•</span>
                      <span><strong>Indie UPC</strong> - $2 per UPC code</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">•</span>
                      <span><strong>Single UPC</strong> - $5 per code</span>
                    </li>
                  </ul>
                  <p className="text-xs text-amber-600 mt-2 flex gap-1">
                    <span>⚠️</span>
                    <span>Make sure the service provides legitimate GS1-registered codes.</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Important Notes */}
          <section className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Notes</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>Each release needs its own unique GTIN (singles, EPs, and albums all require separate codes)</span>
              </p>
              <p className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>A GTIN is permanent - it stays with that release forever, even if you change distributors</span>
              </p>
              <p className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>If you make significant changes to a release (adding/removing tracks, different artwork), you may need a new GTIN</span>
              </p>
              <p className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>Never reuse a GTIN for a different release - this causes tracking and payment issues</span>
              </p>
            </div>
          </section>

          {/* Already Have One? */}
          <section className="bg-green-50 rounded-2xl p-5 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Already Have a GTIN?
            </h3>
            <p className="text-sm text-green-800">
              Great! Just enter your UPC (12 digits) or EAN (13 digits) in the field above.
              We&apos;ll automatically look up your release details if they&apos;re registered in the MusicBrainz database.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-3xl border-t">
          <Button
            onClick={onClose}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Got it, thanks!
          </Button>
        </div>
      </div>
    </div>
  )
}
