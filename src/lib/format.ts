const numberFormat = new Intl.NumberFormat("fa-IR");
const dateFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Tehran",
});
const dateTimeFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Tehran",
});

/** 1234567 → ۱٬۲۳۴٬۵۶۷ */
export function formatNumber(value: number | bigint) {
  return numberFormat.format(value);
}

/** Jalali date, e.g. ۱۷ آبان ۱۴۰۵ */
export function formatDate(value: Date | null | undefined) {
  return value ? dateFormat.format(value) : "—";
}

/** Jalali date and time, e.g. ۱۷ آبان ۱۴۰۵، ۱۴:۲۰ */
export function formatDateTime(value: Date | null | undefined) {
  return value ? dateTimeFormat.format(value) : "—";
}

/** Gregorian "YYYY-MM-DD" day → Jalali display, e.g. ۱۷ آبان ۱۴۰۵ */
export function formatJalaliDay(isoDay: string) {
  return dateFormat.format(new Date(`${isoDay}T12:00:00+03:30`));
}

const shortDateFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tehran",
});

/** Jalali numeric date, e.g. ۱۴۰۵/۰۸/۱۷ */
export function formatShortDate(value: Date | null | undefined) {
  return value ? shortDateFormat.format(value) : "—";
}
