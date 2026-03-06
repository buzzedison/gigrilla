'use client'

import { useState } from 'react'
import { ExternalLink, Search, ChevronDown, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { PRO_CMO_LIST, PRO_REGIONS, IPI_ISSUING_PROS, type PRORegion } from '../../../data/pro-cmo-list'

type Tab = 'get' | 'find'

interface IPIHelperModalProps {
  trigger?: React.ReactNode
  initialTab?: Tab
}

export function IPIHelperModal({ trigger, initialTab = 'get' }: IPIHelperModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [expandedRegion, setExpandedRegion] = useState<PRORegion | null>('UK & Ireland')

  const prosByRegion = PRO_REGIONS.map(region => ({
    region,
    pros: IPI_ISSUING_PROS.filter(p => p.region === region)
  })).filter(r => r.pros.length > 0)

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <button type="button" className="text-xs text-purple-600 hover:underline font-medium">
            Get / Find an IPI/CAE
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span>🎵</span>
            IPI/CAE Number
          </DialogTitle>
          <p className="text-xs text-foreground/60 pt-1">
            Interested Parties Information / Composer, Author and Publisher number
          </p>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex rounded-lg border border-border overflow-hidden mb-4">
          <button
            type="button"
            onClick={() => setTab('get')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'get'
                ? 'bg-purple-600 text-white'
                : 'bg-muted text-foreground/70 hover:bg-muted/80'
            }`}
          >
            Get an IPI/CAE
          </button>
          <button
            type="button"
            onClick={() => setTab('find')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'find'
                ? 'bg-purple-600 text-white'
                : 'bg-muted text-foreground/70 hover:bg-muted/80'
            }`}
          >
            Find Your IPI/CAE
          </button>
        </div>

        {tab === 'get' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
              <p className="text-sm text-purple-900 font-medium mb-1">What is an IPI/CAE number?</p>
              <p className="text-xs text-purple-800">
                An IPI number is a unique 9–11 digit identifier for <strong>songwriters, lyricists,
                and composers</strong>. It is automatically assigned when you join a Performance Rights
                Organisation (PRO) or Collective Management Organisation (CMO) in your country.
                It is essential for accurate song registration and royalty collection when you
                are credited as a writer.
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-900">
                <span className="font-semibold">For performers only</span> (not songwriters): you may not
                need an IPI. Speak to your PRO. If this field is optional for your profile, you can skip it.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-3">
                Join a PRO in your country to receive your IPI:
              </p>

              <div className="space-y-2">
                {prosByRegion.map(({ region, pros }) => (
                  <div key={region} className="border border-border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedRegion(expandedRegion === region ? null : region)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/50 hover:bg-muted transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-foreground">{region}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-foreground/50">{pros.length} {pros.length === 1 ? 'PRO' : 'PROs'}</span>
                        {expandedRegion === region
                          ? <ChevronDown className="w-4 h-4 text-foreground/50" />
                          : <ChevronRight className="w-4 h-4 text-foreground/50" />
                        }
                      </div>
                    </button>

                    {expandedRegion === region && (
                      <div className="divide-y divide-border">
                        {pros.map(pro => (
                          <div key={pro.name} className="px-4 py-3 flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">{pro.name}</p>
                              {pro.note && (
                                <p className="text-xs text-foreground/60 mt-0.5">{pro.note}</p>
                              )}
                            </div>
                            <a
                              href={pro.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline font-medium whitespace-nowrap shrink-0"
                            >
                              Join <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-foreground/10 bg-muted/40 p-3">
              <p className="text-xs text-foreground/60">
                Once you have joined a PRO and been assigned a number, return here and enter your
                IPI in the field above. Gigrilla will validate the format automatically.
              </p>
            </div>
          </div>
        )}

        {tab === 'find' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-900 font-medium mb-1">Already a PRO member?</p>
              <p className="text-xs text-blue-800">
                If you have already joined a Performance Rights Organisation, your IPI/CAE number
                will be in your membership account. You can also search the global CISAC database.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Ways to find your IPI/CAE:</p>

              {/* Method 1 */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Log in to your PRO account</p>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      Your IPI/CAE number is displayed in your member dashboard on your PRO's website
                      (e.g. PRS Online, ASCAP Portal, BMI.com). Look for "IPI", "CAE", or "Member Number".
                    </p>
                  </div>
                </div>
              </div>

              {/* Method 2 */}
              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Search the CISAC IPI database</p>
                    <p className="text-xs text-foreground/60 mb-2 mt-0.5">
                      CISAC maintains a global search tool. Search by your name to find your IPI number.
                    </p>
                    <a
                      href="https://ipisearch.cisac.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                    >
                      ipisearch.cisac.org <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Method 3 */}
              <div className="rounded-lg border border-border p-4">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Contact your PRO directly</p>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      If you can't find it online, contact your PRO's member services team and
                      ask them to confirm your IPI/CAE number. Have your membership ID ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-foreground/10 bg-muted/40 p-3">
              <p className="text-xs text-foreground/60">
                <span className="font-semibold text-foreground">Format:</span> IPI numbers are 9–11 digits,
                e.g. <span className="font-mono font-semibold">00000000000</span> (zero-padded to 11 digits).
                Enter it with or without leading zeros — Gigrilla validates the format automatically.
              </p>
            </div>

            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <a href="https://ipisearch.cisac.org/" target="_blank" rel="noopener noreferrer">
                Search CISAC IPI Database <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
