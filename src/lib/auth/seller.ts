/**
 * Data Access Layer for seller authentication.
 * Every server-side read of "who is the current seller" goes through here,
 * and every seller-owned query must be scoped with the id it returns.
 */
import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { clearSessionCookie, hasSessionCookie, readSession, setSessionCookie } from "@/lib/auth/cookies";
import { SESSION_CONFIG } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const SELLER_LOGIN_PATH = SESSION_CONFIG.seller.loginPath;
export const SELLER_HOME_PATH = SESSION_CONFIG.seller.homePath;
export const SELLER_SESSION_RESET_PATH = "/sellers/session/reset";

/** What the UI is allowed to know about the signed-in seller. */
export type CurrentSeller = {
  id: string;
  name: string;
  phone: string;
};

export const createSellerSession = (sellerId: bigint, remember: boolean) =>
  setSessionCookie("seller", sellerId, remember);

export const destroySellerSession = () => clearSessionCookie("seller");

/** The signed-in seller (verified against the DB), or `null`. Deduplicated per request. */
export const getCurrentSeller = cache(async (): Promise<CurrentSeller | null> => {
  const session = await readSession("seller");
  if (!session) return null;

  const seller = await db.seller.findUnique({
    where: { id: BigInt(session.sub) },
    select: { id: true, name: true, phone: true },
  });
  if (!seller) return null;

  return { id: seller.id.toString(), name: seller.name, phone: seller.phone };
});

/** Use in pages, layouts and server actions that require a seller. */
export async function requireSeller(): Promise<CurrentSeller> {
  const seller = await getCurrentSeller();
  if (!seller) {
    redirect((await hasSessionCookie("seller")) ? SELLER_SESSION_RESET_PATH : SELLER_LOGIN_PATH);
  }
  return seller;
}

/** The current seller's id as BIGINT, for scoping queries. */
export async function requireSellerId(): Promise<bigint> {
  return BigInt((await requireSeller()).id);
}
