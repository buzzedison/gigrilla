const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

type DateInput = string | number | Date | null | undefined

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime())
}

export function parseDateInput(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') return null

  if (value instanceof Date) {
    return isValidDate(value) ? value : null
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null

    // Keep date-only values stable across timezones.
    const simpleDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (simpleDateMatch) {
      const year = Number(simpleDateMatch[1])
      const month = Number(simpleDateMatch[2]) - 1
      const day = Number(simpleDateMatch[3])
      const date = new Date(year, month, day)
      return isValidDate(date) ? date : null
    }

    const parsed = new Date(trimmed)
    return isValidDate(parsed) ? parsed : null
  }

  const parsed = new Date(value)
  return isValidDate(parsed) ? parsed : null
}

export function formatDateDDMMMyyyy(value: DateInput, fallback = 'Unknown date') {
  const date = parseDateInput(value)
  if (!date) return fallback

  const day = String(date.getDate()).padStart(2, '0')
  const month = MONTHS[date.getMonth()]
  const year = String(date.getFullYear())
  return `${day}/${month}/${year}`
}

export function formatTimeHHmm(value: DateInput, fallback = '--:--') {
  const date = parseDateInput(value)
  if (!date) return fallback

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatDateTimeDDMMMyyyy(value: DateInput, fallback = 'Unknown date') {
  const date = parseDateInput(value)
  if (!date) return fallback

  return `${formatDateDDMMMyyyy(date, fallback)} ${formatTimeHHmm(date)}`
}
