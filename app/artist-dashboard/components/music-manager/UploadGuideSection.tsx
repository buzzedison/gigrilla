'use client'

import { useState } from 'react'
import { ChevronRight, FileText, CheckCircle } from 'lucide-react'
import { SectionWrapper, InfoBox } from './shared'
import { ISNIHelperModal } from '../../../signup/components/ISNIHelperModal'
import { IPIHelperModal } from '../../../signup/components/IPIHelperModal'
import { ISRCInfoModal } from './ISRCInfoModal'
import { ISWCInfoModal } from './ISWCInfoModal'
import { GTINInfoModal } from './GTINInfoModal'

interface UploadGuideSectionProps {
  uploadGuideConfirmed: boolean
  onConfirm: (confirmed: boolean) => void
}

export function UploadGuideSection({
  uploadGuideConfirmed,
  onConfirm
}: UploadGuideSectionProps) {
  const [isISRCModalOpen, setIsISRCModalOpen] = useState(false)
  const [isISWCModalOpen, setIsISWCModalOpen] = useState(false)
  const [isGTINModalOpen, setIsGTINModalOpen] = useState(false)

  const infoBlocks = [
    'You CANNOT upload unregistered music of any kind - please register your music first (see below for appropriate registration organisations).',
    'Tracks must be your own Original Works & Sound Recordings, or officially Licensed Covers, or officially Authorised Remixes, or using officially Authorised Samples. You are legally and financially responsible and liable for all music you upload, regardless of territory.',
    'Remember to tick “💾 Apply This (DATA) to All Tracks in This Release” as you complete the Track 1 form, to pre-populate other Track form data, unless each Track in your Specific Release has different data.',
    'Audio Filenames must be = “Artist Name - Track Title.wav”.'
  ]

  const audioRequirements = [
    'WAV/AIFF 16–24-bit, 44.1–96 kHz. No clipping or dithering artifacts.',
    'Loudness Tip: Aim −14 LUFS integrated; avoid limiter pumping. We won’t alter your master.',
    'Stereo required (mono not accepted).',
    'True Peak must be < -1 dBTP (to prevent clipping on streaming platforms).',
    'No silence >2 seconds at start/end of Audio.',
    'Maximum file size: 2GB.',
    'Minimum duration: 30 Seconds; Maximum duration: 60 Minutes.'
  ]

  const codeResources = [
    {
      key: 'isni',
      title: 'Get / Find an ISNI = International Standard Name Identifier (for Creators).',
      description: 'Each Artist Member and the Artist Entity can have individual ISNIs. Your unique digital ID prevents name confusion (such as Artists with the same name), ensures correct crediting, tracks all your work (songs, recordings) across platforms, and guarantees you get paid accurately by linking your various identities (stage names, pseudonyms) to you, like a digital passport for your creative output.'
    },
    {
      key: 'ipi',
      title: 'Get / Find an IPI/CAE = Interested Parties Number (Composer, Author, Publisher).',
      description: "This is for Songwriters, Lyricists, Composers, and Music Publishers - An IPI/CAE number is automatically issued when joining a Performance Rights Organisation (PRO) like ASCAP, BMI, or PRS as a writer/composer; it's a unique ID for tracking royalties (assigned by CISAC) and you can find it in your PRO account. You need this number for accurate song registration and to ensure you get paid for your work."
    },
    {
      key: 'isrc',
      title: 'Get / Find an ISRC = International Standard Recording Code (for Sound Recording).',
      description: 'This is for the Sound Recording. Each unique recording (e.g., Original Studio / Acoustic / Radio Edit / Remastered / Remix / Instrumental / Live version) must have its own unique ISRC. ISRCs are permanent once assigned and should never be reused for another recording, even if the original recording is deleted or the rights change hands.'
    },
    {
      key: 'iswc',
      title: 'Get / Find an ISWC = International Standard Musical Work Code (for Musical Work).',
      description: 'ISWCs identify the underlying composition, whereas an ISRC references a specific recording of a composition. A song/score can only have one ISWC attached to it, but it can have multiple ISRCs. This ensures the original composers/songwriters get paid.'
    },
    {
      key: 'gtin',
      title: 'Get / Find a GTIN = Global Trade Item Number (for this Specific Release).',
      description: 'Either a UPC (12 Digit Universal Product Code) or an EAN (13 Digit European/International Article Number) - you only need one type of GTIN, not both. This is for the specific release of a single or collection of tracks. This helps you get paid properly, enables Official Chart entries, aids in securing sync licensing opportunities, and other business deals.'
    }
  ]

  const helperTriggerClassName = 'inline-flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium'

  const renderGuideHelperTrigger = (resourceKey: string) => {
    const trigger = (
      <button type="button" className={helperTriggerClassName}>
        Get / Find Details
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    )

    switch (resourceKey) {
      case 'isni':
        return <ISNIHelperModal trigger={trigger} />
      case 'ipi':
        return <IPIHelperModal trigger={trigger} />
      case 'isrc':
        return (
          <button type="button" onClick={() => setIsISRCModalOpen(true)} className={helperTriggerClassName}>
            Get / Find Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )
      case 'iswc':
        return (
          <button type="button" onClick={() => setIsISWCModalOpen(true)} className={helperTriggerClassName}>
            Get / Find Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )
      case 'gtin':
        return (
          <button type="button" onClick={() => setIsGTINModalOpen(true)} className={helperTriggerClassName}>
            Get / Find Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )
      default:
        return null
    }
  }

  return (
    <>
      <SectionWrapper
        title="Must-Read Music Upload Guide"
        subtitle="To upload music, first read this guide."
      >
        <div className="flex gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <span aria-hidden="true">ℹ️</span>
          <p>You will not be able to upload any music before confirming that you have read and understood this Upload Guide.</p>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-inner">
          <div className="p-4 md:p-6 space-y-6">
            <div className="space-y-3">
              {infoBlocks.map((text) => (
                <div key={text} className="flex gap-2 text-sm text-gray-800">
                  <span className="text-purple-500" aria-hidden="true">ℹ️</span>
                  <p>{text}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-purple-100 bg-white p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Audio Filename Format</p>
                    <p className="text-sm text-gray-700">Use “Artist Name - Track Title.wav” for every file.</p>
                  </div>
                </div>
                <div className="mt-4 grid md:grid-cols-2 gap-3">
                  {audioRequirements.map((tip) => (
                    <div key={tip} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-800">
                <span className="text-purple-500">ℹ️</span>
                <p>Lyrics must be full and cleanly formatted for each Track, remembering to match lyric version to Track version for radio edits/child-safe Tracks.</p>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-800">
                <span className="text-purple-500">ℹ️</span>
                <p>
                  For each individual Track, you’ll need all relevant ISNI, IPI/CAE, ISRC, &amp; ISWC codes. You’ll also need a GTIN (UPC/EAN) for each Specific Release. Click the ‘Get’ or ‘Find’ links below for help getting or finding these details before you upload your music.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {codeResources.map((resource) => (
                <div key={resource.title} className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{resource.title}</h4>
                  <p className="text-sm text-gray-700 mb-3">{resource.description}</p>
                  {renderGuideHelperTrigger(resource.key)}
                </div>
              ))}
            </div>

            <InfoBox title="Guide Visibility" variant="info">
              <p>This guide is intentionally separate from the release workflow. Use this page whenever you need the full reference while uploading music.</p>
            </InfoBox>

            <div className="border rounded-xl p-4 bg-gray-50">
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={uploadGuideConfirmed}
                  disabled={uploadGuideConfirmed}
                  onChange={(e) => {
                    if (!uploadGuideConfirmed && e.target.checked) onConfirm(true)
                  }}
                  className="mt-1 w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span>I confirm that I have read and understood the Upload Guide.</span>
              </label>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <ISRCInfoModal isOpen={isISRCModalOpen} onClose={() => setIsISRCModalOpen(false)} />
      <ISWCInfoModal isOpen={isISWCModalOpen} onClose={() => setIsISWCModalOpen(false)} />
      <GTINInfoModal isOpen={isGTINModalOpen} onClose={() => setIsGTINModalOpen(false)} />
    </>
  )
}
