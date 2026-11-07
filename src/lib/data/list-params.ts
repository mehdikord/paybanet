/** Helpers to read list state (search, filters, sort, page) from `searchParams`. */

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function getString(params: RawSearchParams, key: string, maxLength = 100): string {
  const value = params[key];
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

/** Returns the value if it is one of `allowed`, otherwise the first allowed value. */
export function getEnum<const T extends readonly string[]>(
  params: RawSearchParams,
  key: string,
  allowed: T,
): T[number] {
  const value = params[key];
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : allowed[0];
}

export function getPage(params: RawSearchParams): number {
  const page = Number(getString(params, "page", 9));
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/** A non-negative integer (Latin or Persian digits, separators allowed), or null. */
export function getNonNegativeInt(params: RawSearchParams, key: string): number | null {
  const raw = getString(params, key, 20)
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[,٬\s]/g, "");
  if (!/^\d+$/.test(raw)) return null;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}

/** Clamp the requested page into [1, pageCount]. */
export function paginate(total: number, page: number, perPage: number) {
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pageCount);
  return { pageCount, page: current, skip: (current - 1) * perPage, take: perPage };
}
