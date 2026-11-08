/**
 * Date helpers.
 *
 * Storage: TIMESTAMP (UTC) in the database — never Jalali strings.
 * A calendar day (e.g. an invoice date) is stored as midnight Asia/Tehran.
 * Transport (URLs, forms): Gregorian ISO day strings "YYYY-MM-DD".
 * Display: Jalali, formatted in Asia/Tehran (see `lib/format.ts`).
 */

export const APP_TIME_ZONE = "Asia/Tehran";
/** Iran has used a fixed UTC+03:30 offset (no DST) since 2022. */
const TEHRAN_OFFSET = "+03:30";

export const ISO_DAY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** Is this a real calendar day in "YYYY-MM-DD" form? */
export function isIsoDay(value: string) {
  if (!ISO_DAY_REGEX.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/** "YYYY-MM-DD" → the instant of 00:00 that day in Tehran. */
export function startOfTehranDay(isoDay: string) {
  return new Date(`${isoDay}T00:00:00${TEHRAN_OFFSET}`);
}

/** "YYYY-MM-DD" → the last millisecond of that day in Tehran. */
export function endOfTehranDay(isoDay: string) {
  return new Date(`${isoDay}T23:59:59.999${TEHRAN_OFFSET}`);
}

const tehranDayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Instant → the Tehran calendar day it falls on, as "YYYY-MM-DD". */
export function toTehranIsoDay(date: Date) {
  return tehranDayFormat.format(date);
}

/** Today in Tehran, as "YYYY-MM-DD". */
export function todayIsoDay() {
  return toTehranIsoDay(new Date());
}

export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const tehranTimeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Instant → its Tehran wall-clock time, as "HH:MM" (24h). */
export function toTehranTime(date: Date) {
  return tehranTimeFormat.format(date);
}

/** Now in Tehran, as "HH:MM". */
export function nowTehranTime() {
  return toTehranTime(new Date());
}

/** Tehran day "YYYY-MM-DD" + wall-clock "HH:MM" → the instant. */
export function tehranDateTime(isoDay: string, time: string) {
  return new Date(`${isoDay}T${time}:00${TEHRAN_OFFSET}`);
}

/**
 * Client side: a date picked in a calendar (local midnight of that day)
 * → "YYYY-MM-DD" using its local calendar components.
 */
export function pickedDateToIsoDay(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Client side: "YYYY-MM-DD" → a local Date for a calendar component. */
export function isoDayToPickerDate(isoDay: string) {
  const [y, m, d] = isoDay.split("-").map(Number);
  return new Date(y, m - 1, d);
}
