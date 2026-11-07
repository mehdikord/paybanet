import { z } from "zod";

import { digitsOnly, MAX_TOMAN } from "@/lib/money";
import { toLatinDigits } from "@/lib/phone";

export const PRODUCT_CODE_REGEX = /^[A-Za-z0-9][A-Za-z0-9._\-/]*$/;

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "نام محصول باید حداقل ۲ حرف باشد." })
    .max(255, { error: "نام محصول بیش از حد طولانی است." }),
  code: z
    .string()
    .trim()
    .transform((value) => toLatinDigits(value))
    .pipe(
      z
        .string()
        .min(1, { error: "کد محصول را وارد کنید." })
        .max(64, { error: "کد محصول حداکثر ۶۴ کاراکتر است." })
        .regex(PRODUCT_CODE_REGEX, {
          error: "کد محصول فقط حروف انگلیسی، عدد و - _ . / را می‌پذیرد.",
        }),
    ),
  /** Toman, as typed (may contain separators). */
  price: z
    .string()
    .transform(digitsOnly)
    .refine((value) => value.length > 0, { error: "قیمت را وارد کنید." })
    .transform(Number)
    .refine((value) => value > 0, { error: "قیمت باید بیشتر از صفر باشد." })
    .refine((value) => value <= MAX_TOMAN, { error: "قیمت بیش از حد بزرگ است." }),
  description: z
    .string()
    .trim()
    .max(255, { error: "توضیحات حداکثر ۲۵۵ کاراکتر است." })
    .transform((value) => value || null),
});

export type ProductInput = z.input<typeof productSchema>;
export type ProductOutput = z.output<typeof productSchema>;
