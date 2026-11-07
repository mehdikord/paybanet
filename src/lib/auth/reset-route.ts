import { NextResponse, type NextRequest } from "next/server";

import { SESSION_CONFIG, type SessionRole } from "@/lib/auth/session";

/** Route handler that clears a stale session cookie and sends the user to login. */
export function sessionResetHandler(role: SessionRole) {
  return function GET(request: NextRequest) {
    const { cookieName, cookiePath, loginPath } = SESSION_CONFIG[role];
    const response = NextResponse.redirect(new URL(loginPath, request.url));
    response.cookies.delete({ name: cookieName, path: cookiePath });
    return response;
  };
}
