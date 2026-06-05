"use client"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { ComposableMap, Geographies, Geography, ZoomableGroup } = require('react-simple-maps') as any
import { useState } from 'react'
/* eslint-disable @typescript-eslint/no-explicit-any */

// ISO 3166-1 Alpha-2 → Numeric lookup
// Used to match the app's alpha-2 country codes to the world-atlas TopoJSON numeric IDs.
const ISO_A2_TO_NUMERIC: Record<string, number> = {
  AF: 4,   AX: 248, AL: 8,   DZ: 12,  AS: 16,  AD: 20,  AO: 24,  AI: 660, AQ: 10,  AG: 28,
  AR: 32,  AM: 51,  AW: 533, AU: 36,  AT: 40,  AZ: 31,  BS: 44,  BH: 48,  BD: 50,  BB: 52,
  BY: 112, BE: 56,  BZ: 84,  BJ: 204, BM: 60,  BT: 64,  BO: 68,  BQ: 535, BA: 70,  BW: 72,
  BV: 74,  BR: 76,  IO: 86,  BN: 96,  BG: 100, BF: 854, BI: 108, CV: 132, KH: 116, CM: 120,
  CA: 124, KY: 136, CF: 140, TD: 148, CL: 152, CN: 156, CX: 162, CC: 166, CO: 170, KM: 174,
  CG: 178, CD: 180, CK: 184, CR: 188, CI: 384, HR: 191, CU: 192, CW: 531, CY: 196, CZ: 203,
  DK: 208, DJ: 262, DM: 212, DO: 214, EC: 218, EG: 818, SV: 222, GQ: 226, ER: 232, EE: 233,
  SZ: 748, ET: 231, FK: 238, FO: 234, FJ: 242, FI: 246, FR: 250, GF: 254, PF: 258, TF: 260,
  GA: 266, GM: 270, GE: 268, DE: 276, GH: 288, GI: 292, GR: 300, GL: 304, GD: 308, GP: 312,
  GU: 316, GT: 320, GG: 831, GN: 324, GW: 624, GY: 328, HT: 332, HM: 334, VA: 336, HN: 340,
  HK: 344, HU: 348, IS: 352, IN: 356, ID: 360, IR: 364, IQ: 368, IE: 372, IM: 833, IL: 376,
  IT: 380, JM: 388, JP: 392, JE: 832, JO: 400, KZ: 398, KE: 404, KI: 296, KP: 408, KR: 410,
  KW: 414, KG: 417, LA: 418, LV: 428, LB: 422, LS: 426, LR: 430, LY: 434, LI: 438, LT: 440,
  LU: 442, MO: 446, MG: 450, MW: 454, MY: 458, MV: 462, ML: 466, MT: 470, MH: 584, MQ: 474,
  MR: 478, MU: 480, YT: 175, MX: 484, FM: 583, MD: 498, MC: 492, MN: 496, ME: 499, MS: 500,
  MA: 504, MZ: 508, MM: 104, NA: 516, NR: 520, NP: 524, NL: 528, NC: 540, NZ: 554, NI: 558,
  NE: 562, NG: 566, NU: 570, NF: 574, MK: 807, MP: 580, NO: 578, OM: 512, PK: 586, PW: 585,
  PS: 275, PA: 591, PG: 598, PY: 600, PE: 604, PH: 608, PN: 612, PL: 616, PT: 620, PR: 630,
  QA: 634, RE: 638, RO: 642, RU: 643, RW: 646, BL: 652, SH: 654, KN: 659, LC: 662, MF: 663,
  PM: 666, VC: 670, WS: 882, SM: 674, ST: 678, SA: 682, SN: 686, RS: 688, SC: 690, SL: 694,
  SG: 702, SX: 534, SK: 703, SI: 705, SB: 90,  SO: 706, ZA: 710, GS: 239, SS: 728, ES: 724,
  LK: 144, SD: 729, SR: 740, SJ: 744, SE: 752, CH: 756, SY: 760, TW: 158, TJ: 762, TZ: 834,
  TH: 764, TL: 626, TG: 768, TK: 772, TO: 776, TT: 780, TN: 788, TR: 792, TM: 795, TC: 796,
  TV: 798, UG: 800, UA: 804, AE: 784, GB: 826, US: 840, UM: 581, UY: 858, UZ: 860, VU: 548,
  VE: 862, VN: 704, VG: 92,  VI: 850, WF: 876, EH: 732, YE: 887, ZM: 894, ZW: 716, XK: 383,
}

// Build the reverse map: numeric string → alpha-2  (used at render time)
const NUMERIC_TO_A2: Record<string, string> = Object.fromEntries(
  Object.entries(ISO_A2_TO_NUMERIC).map(([a2, num]) => [String(num), a2])
)

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface WorldChoroplethMapProps {
  /** ISO alpha-2 codes for selected countries */
  selectedCodes: string[]
  /** Accent colour for selected countries (default: Gigrilla purple) */
  selectedFill?: string
  /** Fill for non-selected countries */
  emptyFill?: string
  /** Optional label shown above the map */
  label?: string
}

export function WorldChoroplethMap({
  selectedCodes,
  selectedFill = '#7c3aed',
  emptyFill = '#e2e8f0',
  label,
}: WorldChoroplethMapProps) {
  const selectedSet = new Set(selectedCodes.map((c) => c.toUpperCase()))
  const [tooltip, setTooltip] = useState<{ name: string; selected: boolean } | null>(null)

  const isSelected = (geoId: string) => {
    const a2 = NUMERIC_TO_A2[geoId]
    return a2 ? selectedSet.has(a2) : false
  }

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden">
      {label && (
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-700">{label}</p>
          {selectedCodes.length > 0 && (
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
              {selectedCodes.length} selected
            </span>
          )}
        </div>
      )}

      <div className="w-full" style={{ aspectRatio: '2 / 1.05' }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 130, center: [0, 20] }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup zoom={1} minZoom={1} maxZoom={6}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo: any) => {
                  const selected = isSelected(String(geo.id))
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={selected ? selectedFill : emptyFill}
                      stroke="#fff"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: 'none' },
                        hover: {
                          outline: 'none',
                          fill: selected ? '#6d28d9' : '#cbd5e1',
                          cursor: 'pointer',
                        },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={() =>
                        setTooltip({
                          name: geo.properties?.name ?? 'Unknown',
                          selected,
                        })
                      }
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 pb-3 pt-1">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-5 rounded-sm"
            style={{ background: selectedFill }}
          />
          <span className="text-xs text-slate-600">Selected ({selectedCodes.length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-5 rounded-sm border border-slate-200"
            style={{ background: emptyFill }}
          />
          <span className="text-xs text-slate-600">Not selected</span>
        </div>
        {tooltip && (
          <span className="ml-auto text-xs font-medium text-slate-700">
            {tooltip.name}
            {tooltip.selected && (
              <span className="ml-1 text-purple-600">✓</span>
            )}
          </span>
        )}
      </div>
    </div>
  )
}
