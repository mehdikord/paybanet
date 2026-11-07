/**
 * MySQL connection settings, read from DATABASE_URL only (single source of truth
 * shared with the Prisma CLI). Credentials in the URL must be percent-encoded,
 * e.g. `p4&Ks1` → `p4%26Ks1`; they are decoded here.
 *
 * Used by the app (`lib/db.ts`) and the seeder (`prisma/seed.ts`).
 */
import type { PoolConfig } from "mariadb";

export function databaseConfig(connectionLimit: number): PoolConfig {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL is not set.");

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(
      "DATABASE_URL is not a valid URL. Percent-encode special characters in the user/password (e.g. & → %26, # → %23, @ → %40).",
    );
  }
  if (url.protocol !== "mysql:" && url.protocol !== "mariadb:") {
    throw new Error(`DATABASE_URL must start with mysql:// (got ${url.protocol}//).`);
  }

  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    // Store and read TIMESTAMPs as UTC, independent of the server/Node time zone.
    timezone: "Z",
    connectionLimit,
    // Fail fast with a clear error instead of waiting the default 10s.
    acquireTimeout: 5_000,
    connectTimeout: 5_000,
  };
}
