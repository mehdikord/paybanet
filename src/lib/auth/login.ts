/**
 * Shared phone + password login flow for every panel:
 * validation, rate limiting, constant-time-ish credential check, session cookie.
 */
import "server-only";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";

import { setSessionCookie } from "@/lib/auth/cookies";
import { checkRateLimit, registerFailure, resetRateLimit } from "@/lib/auth/rate-limit";
import type { SessionRole } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { toPersianDigits } from "@/lib/phone";
import { loginSchema, type LoginState } from "@/lib/validations/auth";

const INVALID_CREDENTIALS = "شماره موبایل یا رمز عبور درست نیست.";

// Compared against when the phone does not exist, so response time
// does not reveal which mobile numbers are registered.
let dummyHash: string | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hashSync("paybanet-timing-guard", 12));

async function findCredentials(role: SessionRole, phone: string) {
  const select = { id: true, password: true } as const;
  return role === "admin"
    ? db.admin.findUnique({ where: { phone }, select })
    : db.seller.findUnique({ where: { phone }, select });
}

/**
 * Validates the form, checks the credentials and sets the session cookie.
 * Returns `{ ok: true }` on success; the caller redirects.
 */
export async function attemptLogin(role: SessionRole, formData: FormData): Promise<LoginState> {
  const rawPhone = String(formData.get("phone") ?? "");
  const parsed = loginSchema.safeParse({
    phone: rawPhone,
    password: formData.get("password") ?? "",
    remember: formData.get("remember") === "on",
  });

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return {
      ok: false,
      phone: rawPhone,
      fieldErrors: { phone: fieldErrors.phone, password: fieldErrors.password },
    };
  }

  const { phone, password, remember } = parsed.data;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limitKey = `${role}-login:${ip}:${phone}`;
  const limit = checkRateLimit(limitKey);
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterMs / 60_000);
    return {
      ok: false,
      phone,
      message: `تعداد تلاش‌ها زیاد بود. ${toPersianDigits(minutes)} دقیقه دیگر دوباره امتحان کنید.`,
    };
  }

  const user = await findCredentials(role, phone);

  // Laravel stores bcrypt hashes as $2y$; bcryptjs understands $2a$/$2b$.
  const hash = user?.password.replace(/^\$2y\$/, "$2b$") ?? getDummyHash();
  const passwordMatches = await bcrypt.compare(password, hash);

  if (!user || !passwordMatches) {
    registerFailure(limitKey);
    return { ok: false, phone, message: INVALID_CREDENTIALS };
  }

  resetRateLimit(limitKey);
  await setSessionCookie(role, user.id, remember);
  return { ok: true };
}
