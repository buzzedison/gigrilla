'use client'

import { ChevronDown, ChevronRight, ChevronUp, FileText, CheckCircle } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { SectionWrapper, InfoBox } from './shared'

interface UploadGuideSectionProps {
  showUploadGuide: boolean
  uploadGuideConfirmed: boolean
  onToggle: () => void
  onConfirm: (confirmed: boolean) => void
}

export function UploadGuideSection({
  showUploadGuide,
  uploadGuideConfirmed,
  onToggle,
  onConfirm
}: UploadGuideSectionProps) {
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
      title: 'Get / Find an ISNI = International Standard Name Identifier (for Creators).',
      description: 'Each Artist Member and the Artist Entity can have individual ISNIs. Your unique digital ID prevents name confusion (such as Artists with the same name), ensures correct crediting, tracks all your work (songs, recordings) across platforms, and guarantees you get paid accurately by linking your various identities (stage names, pseudonyms) to you, like a digital passport for your creative output.',
      url: 'https://isni.org/'
    },
    {
      title: 'Get / Find an IPI/CAE = Interested Parties Number (Composer, Author, Publisher).',
      description: "This is for Songwriters, Lyricists, Composers, and Music Publishers - An IPI/CAE number is automatically issued when joining a Performance Rights Organisation (PRO) like ASCAP, BMI, or PRS as a writer/composer; it's a unique ID for tracking royalties (assigned by CISAC) and you can find it in your PRO account. You need this number for accurate song registration and to ensure you get paid for your work.",
      url: 'https://www.cisac.org/'
    },
    {
      title: 'Get / Find an ISRC = International Standard Recording Code (for Sound Recording).',
      description: 'This is for the Sound Recording. Each unique recording (e.g., Original Studio / Acoustic / Radio Edit / Remastered / Remix / Instrumental / Live version) must have its own unique ISRC. ISRCs are permanent once assigned and should never be reused for another recording, even if the original recording is deleted or the rights change hands.',
      url: 'https://usisrc.org/'
    },
    {
      title: 'Get / Find an ISWC = International Standard Musical Work Code (for Musical Work).',
      description: 'ISWCs identify the underlying composition, whereas an ISRC references a specific recording of a composition. A song/score can only have one ISWC attached to it, but it can have multiple ISRCs. This ensures the original composers/songwriters get paid.',
      url: 'https://www.iswc.org/'
    },
    {
      title: 'Get / Find a GTIN = Global Trade Item Number (for this Specific Release).',
      description: 'Either a UPC (12 Digit Universal Product Code) or an EAN (13 Digit European/International Article Number) - you only need one type of GTIN, not both. This is for the specific release of a single or collection of tracks. This helps you get paid properly, enables Official Chart entries, aids in securing sync licensing opportunities, and other business deals.',
      url: 'https://www.gs1.org/'
    }
  ]

  return (
    <SectionWrapper
      title="Upload Guide for Pre-Registered Music"
      subtitle="Show / Hide Upload Guide below (must tick confirmation underneath)"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          disabled={!uploadGuideConfirmed}
          className="text-gray-700"
        >
          {showUploadGuide ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" /> Hide Upload Guide
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" /> Show Upload Guide
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500">
          Tips load automatically and can be hidden once you’ve confirmed the guide.
        </p>
      </div>

      <div className="mt-4 border rounded-xl p-4 bg-gray-50">
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
          <span>I confirm that I have read and understood the Upload Guide below.</span>
        </label>
      </div>

      {showUploadGuide && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-inner">
          <div className="p-4 md:p-6 space-y-6 max-h-[560px] overflow-y-auto pr-2">
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
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Get / Find Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              ))}
            </div>

            <InfoBox title="Guide Visibility" variant="info">
              <p>Everything above is auto-shown until you confirm the checklist. After that, the Show/Hide control simply remembers your preference per admin account.</p>
            </InfoBox>
          </div>
        </div>
      )}

      {!showUploadGuide && uploadGuideConfirmed && (
        <div className="flex items-center gap-2 text-sm text-green-600 mt-3">
          <CheckCircle className="w-4 h-4" />
          Upload Guide confirmed. Toggle available anytime.
        </div>
      )}
    </SectionWrapper>
  )
}
