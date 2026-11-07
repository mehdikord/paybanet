/**
 * Money helpers. Amounts are stored in Rial (BIGINT) and shown/entered in Toman.
 * 1 Toman = 10 Rial.
 */
import { toLatinDigits } from "@/lib/phone";

export const MAX_TOMAN = 1_000_000_000_000; // 1,000 billion Toman

export const rialToToman = (rial: bigint) => rial / BigInt(10);
export const tomanToRial = (toman: number) => BigInt(toman) * BigInt(10);

/** "1,250,000" / "۱٬۲۵۰٬۰۰۰" → "1250000" (digits only). */
export function digitsOnly(value: string) {
  return toLatinDigits(value).replace(/[^\d]/g, "");
}

/** Live formatting for an amount input: "1250000" → "1,250,000". */
export function formatAmountInput(value: string) {
  const digits = digitsOnly(value).replace(/^0+(?=\d)/, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const tomanFormat = new Intl.NumberFormat("fa-IR");

/** Toman amount for display, e.g. ۱٬۲۵۰٬۰۰۰ */
export function formatToman(toman: bigint | number | string) {
  return tomanFormat.format(BigInt(toman));
}
