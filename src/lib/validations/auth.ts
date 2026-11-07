import { z } from "zod";

import { IRAN_MOBILE_REGEX, normalizeMobile } from "@/lib/phone";

/** Shared by the client form (instant feedback) and the server action (source of truth). */
export const loginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, { error: "شماره موبایل را وارد کنید." })
    .transform(normalizeMobile)
    .refine((value) => IRAN_MOBILE_REGEX.test(value), {
      error: "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.",
    }),
  password: z
    .string()
    .min(1, { error: "رمز عبور را وارد کنید." })
    .max(128, { error: "رمز عبور بیش از حد طولانی است." }),
  remember: z.boolean().default(false),
});

export type LoginInput = z.input<typeof loginSchema>;
export type LoginOutput = z.output<typeof loginSchema>;

export type LoginState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<"phone" | "password", string[]>>;
  /** Echo back the phone so the field keeps its value after a failed attempt. */
  phone?: string;
};
