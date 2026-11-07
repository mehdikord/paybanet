import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_DURATION_SECONDS,
  REMEMBER_DURATION_SECONDS,
  SESSION_CONFIG,
  signSession,
  verifySession,
  type SessionRole,
} from "@/lib/auth/session";

export async function setSessionCookie(role: SessionRole, userId: bigint, remember: boolean) {
  const { cookieName, cookiePath } = SESSION_CONFIG[role];
  const maxAge = remember ? REMEMBER_DURATION_SECONDS : DEFAULT_DURATION_SECONDS;
  const token = await signSession(role, userId, maxAge);

  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: cookiePath,
    // Without "remember me" the cookie dies with the browser session.
    ...(remember ? { maxAge } : {}),
  });
}

export async function clearSessionCookie(role: SessionRole) {
  const { cookieName, cookiePath } = SESSION_CONFIG[role];
  (await cookies()).delete({ name: cookieName, path: cookiePath });
}

export async function hasSessionCookie(role: SessionRole) {
  return (await cookies()).has(SESSION_CONFIG[role].cookieName);
}

/** Verified session payload from the request cookie, or null. */
export async function readSession(role: SessionRole) {
  const token = (await cookies()).get(SESSION_CONFIG[role].cookieName)?.value;
  return verifySession(role, token);
}

/** Only allow redirects back into the given panel (prevents open redirects). */
export function safePanelRedirect(role: SessionRole, target: unknown): string {
  const { homePath, loginPath } = SESSION_CONFIG[role];
  if (
    typeof target === "string" &&
    (target === homePath || target.startsWith(homePath + "/") || target.startsWith(homePath + "?")) &&
    !target.startsWith(loginPath)
  ) {
    return target;
  }
  return homePath;
}
