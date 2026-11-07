const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Converts Persian/Arabic digits to Latin digits. */
export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const persian = PERSIAN_DIGITS.indexOf(char);
    return String(persian !== -1 ? persian : ARABIC_DIGITS.indexOf(char));
  });
}

/** Converts Latin digits to Persian digits (for display). */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/**
 * Normalizes an Iranian mobile number to `09XXXXXXXXX`.
 * Accepts Persian/Arabic digits, spaces, dashes, and the +98 / 0098 / 98 prefixes.
 */
export function normalizeMobile(raw: string): string {
  let value = toLatinDigits(raw).replace(/[\s\-()]/g, "");

  if (value.startsWith("+98")) value = "0" + value.slice(3);
  else if (value.startsWith("0098")) value = "0" + value.slice(4);
  else if (value.startsWith("98") && value.length === 12) value = "0" + value.slice(2);
  else if (value.startsWith("9") && value.length === 10) value = "0" + value;

  return value;
}

export const IRAN_MOBILE_REGEX = /^09\d{9}$/;
