'use client'

import { useState } from 'react'
import { ExternalLink, Search, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'

type Tab = 'get' | 'find'

interface ISNIHelperModalProps {
  trigger?: React.ReactNode
  initialTab?: Tab
}

export function ISNIHelperModal({ trigger, initialTab = 'get' }: ISNIHelperModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab)

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <button type="button" className="text-xs text-purple-600 hover:underline font-medium">
            Get / Find an ISNI
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span>🆔</span>
            International Standard Name Identifier (ISNI)
          </DialogTitle>
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
            Get an ISNI
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
            Find Your ISNI
          </button>
        </div>

        {tab === 'get' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
              <p className="text-sm text-purple-900 font-medium mb-1">What is an ISNI?</p>
              <p className="text-xs text-purple-800">
                An ISNI (International Standard Name Identifier) is a 16-digit global ID that uniquely
                identifies you as a public identity — preventing name confusion and ensuring your
                work is correctly credited across every platform, database, and royalty system worldwide.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">How to get your ISNI:</p>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Visit the ISNI Request page</p>
                    <p className="text-xs text-foreground/60 mb-1">Go to the official ISNI registration portal and click "Request an ISNI".</p>
                    <a
                      href="https://isni.org/page/requests/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline font-medium"
                    >
                      isni.org/page/requests/ <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Complete the registration form</p>
                    <p className="text-xs text-foreground/60">
                      Provide your full name, date of birth, nationality, and examples of your
                      publicly released work (albums, songs, recordings, or compositions) so the
                      ISNI agency can verify your identity.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Wait for approval</p>
                    <div className="flex items-center gap-1 text-xs text-amber-700 mt-0.5">
                      <Clock className="w-3 h-3" />
                      Typically 2–6 weeks for new registrations
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Receive your 16-digit ISNI</p>
                    <p className="text-xs text-foreground/60">
                      You'll receive an ISNI in the format: <span className="font-mono font-semibold">0000 0001 2103 2164</span>.
                      Enter it above and we'll verify it against the ISNI registry for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Already a member of a PRO?</span> Your Performance Rights Organisation
                  (e.g. PRS for Music, ASCAP, BMI) may have already registered an ISNI for you. Try
                  the "Find Your ISNI" tab first.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-800">
                  ISNI registration is <span className="font-semibold">free</span>. You do not need to pay to obtain an ISNI.
                </p>
              </div>
            </div>

            <Button
              asChild
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              <a href="https://isni.org/page/requests/" target="_blank" rel="noopener noreferrer">
                Go to ISNI Registration <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </Button>
          </div>
        )}

        {tab === 'find' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-900 font-medium mb-1">Already have an ISNI?</p>
              <p className="text-xs text-blue-800">
                If you've been active as a recording or performing artist, your ISNI may already exist
                in the public registry — registered by a PRO, record label, or library on your behalf.
                Search the database before applying for a new one.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">How to find your ISNI:</p>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Search the ISNI public database</p>
                    <p className="text-xs text-foreground/60 mb-1">
                      Use your artist/stage name or legal name. Try variations if you don't appear
                      on the first search.
                    </p>
                    <a
                      href="https://isni.org/page/search-database/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                    >
                      isni.org/page/search-database/ <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Check with your PRO or publisher</p>
                    <p className="text-xs text-foreground/60">
                      If you are a member of a Performance Rights Organisation (PRS, ASCAP, BMI, etc.)
                      or have a music publisher, they may have registered an ISNI for you. Contact
                      them directly and ask for your ISNI record.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-foreground/10 bg-muted/40 p-3">
              <p className="text-xs text-foreground/60">
                <span className="font-semibold text-foreground">Format reminder:</span> ISNIs are 16 digits,
                sometimes displayed with spaces as <span className="font-mono font-semibold">0000 0001 2103 2164</span>.
                The final character may be the letter X (check digit). Enter it with or without spaces —
                Gigrilla will format and verify it automatically.
              </p>
            </div>

            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <a href="https://isni.org/page/search-database/" target="_blank" rel="noopener noreferrer">
                Search ISNI Database <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
