import { z } from "zod";

import { IRAN_MOBILE_REGEX, normalizeMobile, toLatinDigits } from "@/lib/phone";
import { isValidEconomicCode, isValidNationalCode } from "./iran";

const PASSWORD_MIN = 8;

/** Optional digit-only field: Persian digits allowed, empty → null. */
const optionalDigits = (message: string, isValid: (value: string) => boolean) =>
  z
    .string()
    .trim()
    .transform((value) => toLatinDigits(value).replace(/[\s-]/g, ""))
    .refine((value) => value === "" || isValid(value), { error: message })
    .transform((value) => (value === "" ? null : value));

const baseFields = {
  name: z
    .string()
    .trim()
    .min(2, { error: "نام فروشنده باید حداقل ۲ حرف باشد." })
    .max(255, { error: "نام فروشنده بیش از حد طولانی است." }),
  phone: z
    .string()
    .trim()
    .min(1, { error: "شماره موبایل را وارد کنید." })
    .transform(normalizeMobile)
    .refine((value) => IRAN_MOBILE_REGEX.test(value), {
      error: "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.",
    }),
  nationalCode: optionalDigits("کد ملی معتبر نیست.", isValidNationalCode),
  economicCode: optionalDigits("کد اقتصادی باید ۱۰ تا ۱۲ رقم باشد.", isValidEconomicCode),
};

const password = z
  .string()
  .min(PASSWORD_MIN, { error: `رمز عبور باید حداقل ${PASSWORD_MIN.toLocaleString("fa-IR")} کاراکتر باشد.` })
  .max(72, { error: "رمز عبور حداکثر ۷۲ کاراکتر است." });

const passwordsMatch = (data: { password?: string; passwordConfirmation?: string }) =>
  (data.password ?? "") === (data.passwordConfirmation ?? "");
const mismatch = { error: "تکرار رمز عبور با رمز عبور یکسان نیست.", path: ["passwordConfirmation"] };

export const createSellerSchema = z
  .object({ ...baseFields, password, passwordConfirmation: z.string() })
  .refine(passwordsMatch, mismatch);

/** On edit, an empty password means "keep the current password". */
export const updateSellerSchema = z
  .object({
    ...baseFields,
    password: z.union([z.literal(""), password]),
    passwordConfirmation: z.string(),
  })
  .refine(passwordsMatch, mismatch);

export type SellerFormInput = z.input<typeof createSellerSchema>;
export type SellerFormOutput = z.output<typeof createSellerSchema>;
export type SellerField = keyof SellerFormInput;

export type SellerActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<SellerField, string[]>>;
};

/** Parses a FormData produced by the seller form. */
export function sellerFormDataToObject(formData: FormData) {
  const get = (key: string) => String(formData.get(key) ?? "");
  return {
    name: get("name"),
    phone: get("phone"),
    password: get("password"),
    passwordConfirmation: get("passwordConfirmation"),
    nationalCode: get("nationalCode"),
    economicCode: get("economicCode"),
  };
}
