/**
 * Data Access Layer for admin authentication.
 * Every server-side read of "who is the current admin" goes through here.
 */
import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { clearSessionCookie, hasSessionCookie, readSession, setSessionCookie } from "@/lib/auth/cookies";
import { SESSION_CONFIG } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const ADMIN_LOGIN_PATH = SESSION_CONFIG.admin.loginPath;
export const ADMIN_HOME_PATH = SESSION_CONFIG.admin.homePath;
export const ADMIN_SESSION_RESET_PATH = "/admins/session/reset";

/** What the UI is allowed to know about the signed-in admin. */
export type CurrentAdmin = {
  id: string;
  name: string;
  phone: string;
};

export const createAdminSession = (adminId: bigint, remember: boolean) =>
  setSessionCookie("admin", adminId, remember);

export const destroyAdminSession = () => clearSessionCookie("admin");

/**
 * Returns the signed-in admin, or `null`. Verifies the token AND that the admin
 * still exists in the database. Deduplicated per request.
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const session = await readSession("admin");
  if (!session) return null;

  const admin = await db.admin.findUnique({
    where: { id: BigInt(session.sub) },
    select: { id: true, name: true, phone: true },
  });
  if (!admin) return null;

  return { id: admin.id.toString(), name: admin.name, phone: admin.phone };
});

/** Use in pages, layouts and server actions that require an admin. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    // A signed cookie for an admin that no longer exists must be cleared first.
    redirect((await hasSessionCookie("admin")) ? ADMIN_SESSION_RESET_PATH : ADMIN_LOGIN_PATH);
  }
  return admin;
}
