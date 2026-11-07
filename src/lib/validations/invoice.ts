import { z } from "zod";

import { isIsoDay } from "@/lib/dates";
import { digitsOnly, MAX_TOMAN } from "@/lib/money";

export const MAX_INVOICE_ITEMS = 100;
export const MAX_QUANTITY = 100_000;

const idString = (message: string) =>
  z.string().regex(/^[1-9]\d{0,18}$/, { error: message });

export const invoiceItemSchema = z.object({
  productId: idString("محصول را انتخاب کنید."),
  /** Display-only: product name (so the picker can show the current choice). */
  productName: z.string().optional(),
  quantity: z
    .string()
    .transform(digitsOnly)
    .refine((v) => v.length > 0, { error: "تعداد را وارد کنید." })
    .transform(Number)
    .refine((v) => Number.isInteger(v) && v >= 1, { error: "حداقل ۱" })
    .refine((v) => v <= MAX_QUANTITY, { error: "تعداد بیش از حد است." }),
  /** Unit price in Toman, as typed (may contain separators). */
  price: z
    .string()
    .transform(digitsOnly)
    .refine((v) => v.length > 0, { error: "قیمت را وارد کنید." })
    .transform(Number)
    .refine((v) => v <= MAX_TOMAN, { error: "قیمت بیش از حد است." }),
});

export const invoiceSchema = z.object({
  customerId: idString("مشتری را انتخاب کنید."),
  /** Display-only: customer name for the picker. */
  customerName: z.string().optional(),
  /** Gregorian "YYYY-MM-DD"; stored as midnight Asia/Tehran. */
  invoiceDate: z.string().refine(isIsoDay, { error: "تاریخ فاکتور را انتخاب کنید." }),
  items: z
    .array(invoiceItemSchema)
    .min(1, { error: "حداقل یک محصول به فاکتور اضافه کنید." })
    .max(MAX_INVOICE_ITEMS, { error: `حداکثر ${MAX_INVOICE_ITEMS.toLocaleString("fa-IR")} ردیف مجاز است.` }),
});

export type InvoiceInput = z.input<typeof invoiceSchema>;
export type InvoiceOutput = z.output<typeof invoiceSchema>;
export type InvoiceItemInput = z.input<typeof invoiceItemSchema>;

/** Line total in Toman for the live preview (never trusted by the server). */
export function lineTotalToman(item: Pick<InvoiceItemInput, "quantity" | "price">): bigint {
  const qty = digitsOnly(item.quantity ?? "");
  const price = digitsOnly(item.price ?? "");
  if (!qty || !price) return BigInt(0);
  return BigInt(qty) * BigInt(price);
}
