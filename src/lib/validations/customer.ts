import { z } from "zod";

import { IRAN_MOBILE_REGEX, normalizeMobile, toLatinDigits } from "@/lib/phone";
import { isValidEconomicCode } from "./iran";

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "نام مشتری باید حداقل ۲ حرف باشد." })
    .max(255, { error: "نام مشتری بیش از حد طولانی است." }),
  phone: z
    .string()
    .trim()
    .min(1, { error: "شماره موبایل را وارد کنید." })
    .transform(normalizeMobile)
    .refine((value) => IRAN_MOBILE_REGEX.test(value), {
      error: "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.",
    }),
  economicCode: z
    .string()
    .trim()
    .transform((value) => toLatinDigits(value).replace(/[\s-]/g, ""))
    .refine((value) => value === "" || isValidEconomicCode(value), {
      error: "کد اقتصادی باید ۱۰ تا ۱۲ رقم باشد.",
    })
    .transform((value) => value || null),
  description: z
    .string()
    .trim()
    .max(255, { error: "توضیحات حداکثر ۲۵۵ کاراکتر است." })
    .transform((value) => value || null),
});

export type CustomerInput = z.input<typeof customerSchema>;
export type CustomerOutput = z.output<typeof customerSchema>;
