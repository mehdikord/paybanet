/**
 * Resolves which seller a seller-owned query or mutation acts on.
 *
 * - No `sellerId` → the signed-in seller (seller panel).
 * - A `sellerId`  → the caller must be a signed-in admin (admin panel managing
 *   that seller). A seller passing an id is redirected to the admin login, so a
 *   seller can never reach another seller's data this way.
 */
import "server-only";

import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { requireSellerId } from "@/lib/auth/seller";
import { db } from "@/lib/db";

export async function resolveSellerId(sellerId?: string | null): Promise<bigint> {
  if (sellerId == null) return requireSellerId();

  await requireAdmin();
  // Server-action arguments are untrusted: accept only a positive integer string.
  if (typeof sellerId !== "string" || !/^[1-9]\d{0,18}$/.test(sellerId)) notFound();
  const seller = await db.seller.findUnique({ where: { id: BigInt(sellerId) }, select: { id: true } });
  if (!seller) notFound();
  return seller.id;
}
