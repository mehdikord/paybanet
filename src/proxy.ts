/**
 * Optimistic route protection for the admin and seller panels: visitors without
 * a valid signed cookie for that panel are sent to its login page.
 * Only checks the cookie (no DB); the real check happens in each panel's
 * Data Access Layer (`requireAdmin` / `requireSeller`).
 */
import { NextResponse, type NextRequest } from "next/server";

import { SESSION_CONFIG, verifySession, type SessionConfig } from "@/lib/auth/session";

/** Paths inside a panel that must stay reachable without a session. */
const PUBLIC_SUFFIXES = ["/login", "/session/reset"];

function panelFor(pathname: string): SessionConfig | null {
  for (const config of Object.values(SESSION_CONFIG)) {
    if (pathname === config.homePath || pathname.startsWith(config.homePath + "/")) return config;
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const panel = panelFor(pathname);
  if (!panel) return NextResponse.next();

  if (PUBLIC_SUFFIXES.some((suffix) => pathname === panel.homePath + suffix)) {
    // Signed-in users on the login page are redirected by the page itself
    // (after a DB check), so a stale cookie can never cause a redirect loop.
    return NextResponse.next();
  }

  const session = await verifySession(panel.role, request.cookies.get(panel.cookieName)?.value);
  if (session) return NextResponse.next();

  const url = new URL(panel.loginPath, request.url);
  if (pathname !== panel.homePath) url.searchParams.set("callbackUrl", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admins", "/admins/:path*", "/sellers", "/sellers/:path*"],
};
