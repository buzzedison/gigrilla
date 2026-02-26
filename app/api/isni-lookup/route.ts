import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/isni-lookup?isni=0000000054903863
 *
 * Proxies the OCLC ISNI SRU registry to resolve a 16-digit ISNI number
 * to the registered person / organisation name.
 *
 * The correct SRU index is `pica.isn` (lowercase) in DB=1.2.
 * The query value must be the raw 16 digits with no spaces.
 *
 * Returns:
 *   { found: true,  name: "Usher", isni: "0000 0000 5490 3863" }
 *   { found: false }
 *   { error: "..." }  on validation errors (400) or upstream failures (502)
 */
export async function GET(request: NextRequest) {
  const raw = (request.nextUrl.searchParams.get('isni') ?? '').replace(/[\s\-]/g, '')

  if (!raw) {
    return NextResponse.json({ error: 'isni parameter is required' }, { status: 400 })
  }

  // ISNI is 15 digits + 1 check digit (0–9 or X)
  if (!/^\d{15}[\dX]$/i.test(raw)) {
    return NextResponse.json({ error: 'ISNI must be 16 characters (digits, last may be X)' }, { status: 400 })
  }

  // Keep digits + uppercase X; never include spaces in the query value
  const cleanISNI = raw.toUpperCase()
  // Human-readable "XXXX XXXX XXXX XXXX" form (for display only)
  const formatted = cleanISNI.replace(/(.{4})(.{4})(.{4})(.{4})/, '$1 $2 $3 $4')

  // --- OCLC ISNI SRU endpoint ---
  // Index: pica.isn (lowercase!) — confirmed via ?operation=explain
  // Value: 16 raw digits, no spaces, no hyphens
  const sruUrl =
    `https://isni.oclc.org/sru/DB=1.2/` +
    `?query=pica.isn%3D%22${cleanISNI}%22` +
    `&version=1.1&operation=searchRetrieve&recordSchema=isni-b` +
    `&maximumRecords=1&startRecord=1&recordPacking=xml`

  try {
    const response = await fetch(sruUrl, {
      headers: {
        Accept: 'application/xml, text/xml, */*',
        'User-Agent': 'Gigrilla/1.0',
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 }, // cache 1 hour – ISNI data rarely changes
    })

    if (!response.ok) {
      console.warn('isni-lookup: SRU returned HTTP', response.status)
      return NextResponse.json({ error: 'Could not reach ISNI registry' }, { status: 502 })
    }

    const xml = await response.text()

    // Use numberOfRecords as the success indicator — the SRU endpoint may include
    // informational <diag:diagnostics> even for successful queries (e.g. code 1/0)
    // so we must NOT treat the presence of <diag:uri> as a failure.
    const countMatch = xml.match(/<(?:[^:>]+:)?numberOfRecords[^>]*>(\d+)</)
    const count = countMatch ? parseInt(countMatch[1], 10) : 0

    if (count === 0) {
      return NextResponse.json({ found: false })
    }

    const name = extractNameFromXml(xml)
    return NextResponse.json({
      found: true,
      name: name ? decodeXmlEntities(name) : 'Name not available in registry',
      isni: formatted,
    })
  } catch (err) {
    console.warn('isni-lookup: SRU fetch failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not reach ISNI registry' }, { status: 502 })
  }
}

/**
 * Extract the best display name from an ISNI-B SRU XML response.
 *
 * The XML contains multiple <personalName> blocks with optional <nameUse>
 * values of "public" or "legal". We prefer the shortest public-use surname-only
 * entry (stage names like "Usher"), then any public name, then any non-legal name.
 */
function extractNameFromXml(xml: string): string | null {
  // --- Personal names: parse each <personalName> block as a unit ---
  const blockRegex = /<personalName>([\s\S]*?)<\/personalName>/gi
  const parsed: Array<{ name: string; nameUse: string }> = []
  let m: RegExpExecArray | null

  while ((m = blockRegex.exec(xml)) !== null) {
    const block = m[1]
    const forename = block.match(/<forename[^>]*>([\s\S]*?)<\/forename>/i)?.[1]?.trim() ?? ''
    const surname  = block.match(/<surname[^>]*>([\s\S]*?)<\/surname>/i)?.[1]?.trim() ?? ''
    const nameUse  = block.match(/<nameUse[^>]*>([\s\S]*?)<\/nameUse>/i)?.[1]?.trim().toLowerCase() ?? ''

    const name = [forename, surname].filter(Boolean).join(' ')
    if (name) parsed.push({ name, nameUse })
  }

  if (parsed.length > 0) {
    // 1. Public, surname-only (classic stage name, e.g. "Usher", "Adele")
    const publicSurnameOnly = parsed.filter(p => p.nameUse === 'public' && !p.name.includes(' '))
    if (publicSurnameOnly.length) {
      return normalizeName(publicSurnameOnly.sort((a, b) => a.name.length - b.name.length)[0].name)
    }

    // 2. Any public name (e.g. "Taylor Swift")
    const publicAny = parsed.filter(p => p.nameUse === 'public')
    if (publicAny.length) {
      return normalizeName(publicAny.sort((a, b) => a.name.length - b.name.length)[0].name)
    }

    // 3. Any name that isn't explicitly legal
    const nonLegal = parsed.filter(p => p.nameUse !== 'legal')
    if (nonLegal.length) {
      return normalizeName(nonLegal[0].name)
    }

    // 4. Fallback to first available (legal name)
    return normalizeName(parsed[0].name)
  }

  // --- Organisation: mainName ---
  const mainName = xml.match(/<mainName[^>]*>([\s\S]*?)<\/mainName>/i)?.[1]?.trim()
  if (mainName) return mainName

  return null
}

/** Convert ALL_CAPS names to Title Case (e.g. "USHER" → "Usher") */
function normalizeName(name: string): string {
  if (name === name.toUpperCase() && name.length > 1) {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
  return name
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}
