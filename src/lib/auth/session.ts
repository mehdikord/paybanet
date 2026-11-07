/**
 * Stateless sessions: a signed JWT (HS256) in an httpOnly cookie.
 * Each panel (role) has its own cookie name, cookie path and JWT audience,
 * so an admin token is never accepted by the seller panel and vice versa.
 *
 * Edge-safe (no Node APIs): used by both `proxy.ts` and server code.
 */
import { jwtVerify, SignJWT } from "jose";

export type SessionRole = "admin" | "seller";

export type SessionConfig = {
  role: SessionRole;
  cookieName: string;
  /** Cookie is only sent to this path prefix. */
  cookiePath: string;
  loginPath: string;
  homePath: string;
};

export const SESSION_CONFIG = {
  admin: {
    role: "admin",
    cookieName: "pb_admin_session",
    cookiePath: "/admins",
    loginPath: "/admins/login",
    homePath: "/admins",
  },
  seller: {
    role: "seller",
    cookieName: "pb_seller_session",
    cookiePath: "/sellers",
    loginPath: "/sellers/login",
    homePath: "/sellers",
  },
} as const satisfies Record<SessionRole, SessionConfig>;

/** Session length when "remember me" is checked. */
export const REMEMBER_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days
/** Session length otherwise (the cookie is also a browser-session cookie). */
export const DEFAULT_DURATION_SECONDS = 60 * 60 * 12; // 12 hours

const ISSUER = "paybanet";

export type SessionPayload = {
  /** User id (BIGINT serialized as string). */
  sub: string;
  role: SessionRole;
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or shorter than 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(role: SessionRole, userId: bigint, maxAgeSeconds: number) {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId.toString())
    .setIssuer(ISSUER)
    .setAudience(role)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSecretKey());
}

export async function verifySession(
  role: SessionRole,
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: role,
    });
    if (payload.role !== role || typeof payload.sub !== "string") return null;
    return { sub: payload.sub, role };
  } catch {
    return null;
  }
}
