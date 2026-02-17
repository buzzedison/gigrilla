export interface ParsedImageMetadata {
  width: number
  height: number
  dpiX: number | null
  dpiY: number | null
}

function readUInt16BE(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 8) | bytes[offset + 1]
}

function readUInt32BE(bytes: Uint8Array, offset: number) {
  return (
    (bytes[offset] * 0x1000000) +
    ((bytes[offset + 1] << 16) >>> 0) +
    (bytes[offset + 2] << 8) +
    bytes[offset + 3]
  )
}

function parsePngMetadata(bytes: Uint8Array): ParsedImageMetadata | null {
  if (bytes.length < 24) return null
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  for (let index = 0; index < signature.length; index += 1) {
    if (bytes[index] !== signature[index]) return null
  }

  const width = readUInt32BE(bytes, 16)
  const height = readUInt32BE(bytes, 20)
  let dpiX: number | null = null
  let dpiY: number | null = null

  let offset = 8
  while (offset + 8 <= bytes.length) {
    const chunkLength = readUInt32BE(bytes, offset)
    const chunkTypeOffset = offset + 4
    const dataOffset = offset + 8
    const chunkEnd = dataOffset + chunkLength
    const nextChunkOffset = chunkEnd + 4

    if (chunkEnd > bytes.length || nextChunkOffset > bytes.length) break

    const chunkType = String.fromCharCode(
      bytes[chunkTypeOffset],
      bytes[chunkTypeOffset + 1],
      bytes[chunkTypeOffset + 2],
      bytes[chunkTypeOffset + 3]
    )

    if (chunkType === 'pHYs' && chunkLength >= 9) {
      const xPpm = readUInt32BE(bytes, dataOffset)
      const yPpm = readUInt32BE(bytes, dataOffset + 4)
      const unit = bytes[dataOffset + 8]
      if (unit === 1 && xPpm > 0 && yPpm > 0) {
        dpiX = xPpm * 0.0254
        dpiY = yPpm * 0.0254
      }
      break
    }

    offset = nextChunkOffset
  }

  return { width, height, dpiX, dpiY }
}

function parseJpegMetadata(bytes: Uint8Array): ParsedImageMetadata | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null

  let width: number | null = null
  let height: number | null = null
  let dpiX: number | null = null
  let dpiY: number | null = null
  let offset = 2

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }

    while (offset < bytes.length && bytes[offset] === 0xff) {
      offset += 1
    }
    if (offset >= bytes.length) break

    const marker = bytes[offset]
    offset += 1

    if (marker === 0xd9 || marker === 0xda) break
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue
    if (offset + 1 >= bytes.length) break

    const segmentLength = readUInt16BE(bytes, offset)
    offset += 2
    if (segmentLength < 2 || offset + segmentLength - 2 > bytes.length) break

    const segmentStart = offset
    const segmentEnd = offset + segmentLength - 2

    if (marker === 0xe0 && segmentLength >= 14) {
      const hasJfif =
        bytes[segmentStart] === 0x4a &&
        bytes[segmentStart + 1] === 0x46 &&
        bytes[segmentStart + 2] === 0x49 &&
        bytes[segmentStart + 3] === 0x46 &&
        bytes[segmentStart + 4] === 0x00

      if (hasJfif) {
        const units = bytes[segmentStart + 7]
        const xDensity = readUInt16BE(bytes, segmentStart + 8)
        const yDensity = readUInt16BE(bytes, segmentStart + 10)

        if (units === 1) {
          dpiX = xDensity
          dpiY = yDensity
        } else if (units === 2) {
          dpiX = xDensity * 2.54
          dpiY = yDensity * 2.54
        }
      }
    }

    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf)

    if (isStartOfFrame && segmentLength >= 7) {
      height = readUInt16BE(bytes, segmentStart + 1)
      width = readUInt16BE(bytes, segmentStart + 3)
      if (width > 0 && height > 0) {
        return { width, height, dpiX, dpiY }
      }
    }

    offset = segmentEnd
  }

  if (width && height) {
    return { width, height, dpiX, dpiY }
  }

  return null
}

export function readImageMetadata(bytes: Uint8Array, mimeType: string): ParsedImageMetadata | null {
  if (mimeType === 'image/png') {
    return parsePngMetadata(bytes)
  }

  if (mimeType === 'image/jpeg') {
    return parseJpegMetadata(bytes)
  }

  return null
}
