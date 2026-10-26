import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * APP-WIDE TIMEZONE — all date/time display & calendar logic is pinned to the
 * server's timezone (Asia/Kolkata) instead of the viewer device's local
 * system timezone, so every user sees the same clock regardless of where
 * they browse from. (Asia/Kolkata and Asia/Calcutta are the same IANA zone.)
 *
 * Why pinning matters: date-fns / toLocale* / getDate() etc. all use the
 * HOST's local timezone — the server runs UTC while a browser may run any
 * offset, which produced React hydration mismatches (e.g. server 21/10 vs
 * client 22/10) and device-dependent times. Always format through these
 * helpers instead of Date's local getters / locale defaults.
 */
export const APP_TIMEZONE = "Asia/Kolkata"

/** IST is UTC+05:30 year-round (no DST since 1945), so a fixed offset is safe. */
const IST_OFFSET = "+05:30"

const pad2 = (n: number) => String(n).padStart(2, "0")

const datePartsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const dateTimePartsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

const istComponentsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

function parseValid(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Deterministic calendar-date string ("dd/MM/yyyy", or "dd-MM-yyyy" when
 * `separator` is "-"), identical on server and client. Use this everywhere
 * a date is DISPLAYED (tables, dialogs, filenames) — never date-fns format()
 * or toLocaleDateString() without a timeZone.
 */
export function formatDate(
  value: Date | string | number | null | undefined,
  separator: "/" | "-" = "/",
): string {
  const date = parseValid(value)
  if (!date) return ""
  const parts = datePartsFormatter.formatToParts(date)
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? ""
  return [get("day"), get("month"), get("year")].join(separator)
}

/** "dd/MM/yyyy, HH:mm:ss" in the app timezone (24-hour clock). */
export function formatDateTime(
  value: Date | string | number | null | undefined,
): string {
  const date = parseValid(value)
  if (!date) return ""
  return dateTimePartsFormatter.format(date)
}

/** "HH:mm" in the app timezone (24-hour clock). */
export function formatTime(
  value: Date | string | number | null | undefined,
): string {
  const date = parseValid(value)
  if (!date) return ""
  return timeFormatter.format(date)
}

/** "hh:mm AM/PM" in the app timezone (12-hour clock, uppercase meridiem). */
export function formatTime12(
  value: Date | string | number | null | undefined,
): string {
  const parts = getISTParts(value)
  if (!parts) return ""
  const ampm = parts.hour >= 12 ? "PM" : "AM"
  const hour12 = parts.hour % 12 || 12
  return `${pad2(hour12)}:${pad2(parts.minute)} ${ampm}`
}

export interface ISTParts {
  /** Calendar year in the app timezone. */
  year: number
  /** Calendar month 1–12 in the app timezone. */
  month: number
  /** Calendar day 1–31 in the app timezone. */
  day: number
  /** Hour 0–23 in the app timezone. */
  hour: number
  /** Minute 0–59 in the app timezone. */
  minute: number
  /** Second 0–59 in the app timezone. */
  second: number
  /** Stable "YYYY-MM-DD" calendar-day key — use for day comparisons. */
  dayKey: string
}

/**
 * Calendar components of an instant IN THE APP TIMEZONE. Replaces
 * date.getFullYear()/getMonth()/getDate()/getHours()... which read the
 * viewer's local system timezone.
 */
export function getISTParts(
  value: Date | string | number | null | undefined,
): ISTParts | null {
  const date = parseValid(value)
  if (!date) return null
  const parts = istComponentsFormatter.formatToParts(date)
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? ""
  const year = Number(get("year"))
  const month = Number(get("month"))
  const day = Number(get("day"))
  const hour = Number(get("hour")) % 24
  return {
    year,
    month,
    day,
    hour,
    minute: Number(get("minute")),
    second: Number(get("second")),
    dayKey: `${year}-${pad2(month)}-${pad2(day)}`,
  }
}

/**
 * Build the exact instant for an Asia/Kolkata wall-clock time
 * (e.g. an admin picking "22/10/2026 10:30:00" IST regardless of the
 * browser's own timezone). IST is fixed at UTC+05:30, so an ISO string
 * with the explicit offset is precise.
 */
export function istWallClock(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date {
  return new Date(
    `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}${IST_OFFSET}`,
  )
}

/**
 * Local-midnight Date of the CURRENT Asia/Kolkata calendar day — the
 * timezone-agnostic "today" anchor for "disable past dates" logic in
 * calendar pickers (react-day-picker compares its locally-built grid dates
 * against this instant).
 */
export function istTodayLocalStart(): Date {
  const parts = getISTParts(new Date())
  const today = parts
    ? new Date(parts.year, parts.month - 1, parts.day)
    : new Date()
  today.setHours(0, 0, 0, 0)
  return today
}
