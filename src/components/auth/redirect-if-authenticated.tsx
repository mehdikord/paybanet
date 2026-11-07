import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { getCurrentSeller } from "@/lib/auth/seller";
import { SESSION_CONFIG, type SessionRole } from "@/lib/auth/session";

/**
 * Sends an already signed-in user (verified against the DB) to their panel home.
 * Render inside <Suspense>: it reads the request cookies.
 */
export async function RedirectIfAuthenticated({ role }: { role: SessionRole }) {
  const user = role === "admin" ? await getCurrentAdmin() : await getCurrentSeller();
  if (user) redirect(SESSION_CONFIG[role].homePath);
  return null;
}
