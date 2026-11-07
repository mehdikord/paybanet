"use server";

import { randomInt } from "node:crypto";
import { refresh } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { requireSellerId } from "@/lib/auth/seller";
import { getInvoiceForEdit, type InvoiceDetail } from "@/lib/data/invoices";
import { startOfTehranDay } from "@/lib/dates";
import { db } from "@/lib/db";
import { rialToToman, tomanToRial } from "@/lib/money";
import type { MutationResult } from "@/lib/mutation";
import { toLatinDigits } from "@/lib/phone";
import { invoiceSchema } from "@/lib/validations/invoice";

function parseId(value: unknown): bigint | null {
  return typeof value === "string" && /^[1-9]\d{0,18}$/.test(value) ? BigInt(value) : null;
}

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Random 8-digit token (10000000–99999999), unpredictable and unrelated to the id. */
const newPayLinkToken = () => String(randomInt(10_000_000, 100_000_000));

type InvoiceField = "customerId" | "invoiceDate" | "items";

/** Creates (id = null) or updates one of the seller's invoices. Totals are computed here. */
export async function saveInvoice(
  invoiceId: string | null,
  input: unknown,
): Promise<MutationResult<InvoiceField> & { payLink?: string }> {
  const sellerId = await requireSellerId();

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return {
      ok: false,
      message: "لطفاً خطاهای فرم را برطرف کنید.",
      fieldErrors: {
        customerId: fieldErrors.customerId,
        invoiceDate: fieldErrors.invoiceDate,
        items: fieldErrors.items?.length ? ["ردیف‌های فاکتور را بررسی کنید."] : undefined,
      },
    };
  }
  const { customerId, invoiceDate, items } = parsed.data;

  const id = invoiceId === null ? null : parseId(invoiceId);
  if (invoiceId !== null && !id) return { ok: false, message: "فاکتور پیدا نشد." };

  // Ownership checks: the customer and every product must belong to this seller.
  const customer = await db.customer.findFirst({
    where: { id: BigInt(customerId), sellerId },
    select: { id: true },
  });
  if (!customer) return { ok: false, fieldErrors: { customerId: ["این مشتری در فهرست شما نیست."] } };

  const productIds = [...new Set(items.map((item) => BigInt(item.productId)))];
  const ownedCount = await db.product.count({ where: { id: { in: productIds }, sellerId } });
  if (ownedCount !== productIds.length) {
    return { ok: false, message: "یکی از محصولات انتخاب‌شده در فهرست شما نیست یا حذف شده است." };
  }

  // Server-side total (Rial). Never trust a total sent by the client.
  const orders = items.map((item) => ({
    productId: BigInt(item.productId),
    quantity: item.quantity,
    price: tomanToRial(item.price),
  }));
  const totalPrice = orders.reduce((sum, o) => sum + o.price * BigInt(o.quantity), BigInt(0));
  const data = {
    customerId: customer.id,
    invoiceDate: startOfTehranDay(invoiceDate),
    totalPrice,
  };

  if (id) {
    const exists = await db.invoice.findFirst({ where: { id, sellerId }, select: { id: true } });
    if (!exists) return { ok: false, message: "این فاکتور دیگر وجود ندارد." };

    await db.$transaction([
      db.invoice.update({ where: { id }, data }),
      db.order.deleteMany({ where: { invoiceId: id } }),
      db.order.createMany({ data: orders.map((o) => ({ ...o, invoiceId: id })) }),
    ]);
    refresh();
    return { ok: true, message: `فاکتور شماره ${Number(id).toLocaleString("fa-IR", { useGrouping: false })} ذخیره شد.` };
  }

  // Create with a unique pay-link token (retry on the rare collision).
  for (let attempt = 0; attempt < 5; attempt++) {
    const payLink = newPayLinkToken();
    try {
      const invoice = await db.invoice.create({
        data: {
          ...data,
          sellerId,
          payLink,
          orders: { createMany: { data: orders } },
        },
        select: { id: true },
      });
      refresh();
      return {
        ok: true,
        payLink,
        message: `فاکتور شماره ${Number(invoice.id).toLocaleString("fa-IR", { useGrouping: false })} صادر شد.`,
      };
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  return { ok: false, message: "ساخت لینک پرداخت انجام نشد. دوباره تلاش کنید." };
}

export async function deleteInvoice(invoiceId: string): Promise<MutationResult> {
  const sellerId = await requireSellerId();
  const id = parseId(invoiceId);
  if (!id) return { ok: false, message: "فاکتور پیدا نشد." };

  // Orders are removed by ON DELETE CASCADE.
  const result = await db.invoice.deleteMany({ where: { id, sellerId } });
  if (result.count === 0) return { ok: false, message: "این فاکتور قبلاً حذف شده است." };

  refresh();
  return { ok: true, message: "فاکتور حذف شد." };
}

/** Loads an invoice into the edit modal. */
export async function loadInvoiceForEdit(invoiceId: string): Promise<InvoiceDetail | null> {
  const id = parseId(invoiceId);
  return id ? getInvoiceForEdit(id) : null;
}

export type PickerOption = { id: string; label: string; hint?: string; price?: string };

/** Searchable customer picker (top 20 matches). */
export async function searchCustomerOptions(query: string): Promise<PickerOption[]> {
  const sellerId = await requireSellerId();
  const q = toLatinDigits(query.trim()).slice(0, 100);
  const rows = await db.customer.findMany({
    where: {
      sellerId,
      ...(q && { OR: [{ name: { contains: q } }, { phone: { contains: q } }] }),
    },
    orderBy: q ? [{ name: "asc" }] : [{ id: "desc" }],
    take: 20,
    select: { id: true, name: true, phone: true },
  });
  return rows.map((c) => ({ id: c.id.toString(), label: c.name, hint: c.phone }));
}

/** Searchable product picker (top 20 matches), with the current price in Toman. */
export async function searchProductOptions(query: string): Promise<PickerOption[]> {
  const sellerId = await requireSellerId();
  const q = toLatinDigits(query.trim()).slice(0, 100);
  const rows = await db.product.findMany({
    where: {
      sellerId,
      ...(q && { OR: [{ name: { contains: q } }, { code: { contains: q } }] }),
    },
    orderBy: q ? [{ name: "asc" }] : [{ id: "desc" }],
    take: 20,
    select: { id: true, name: true, code: true, price: true },
  });
  return rows.map((p) => ({
    id: p.id.toString(),
    label: p.name,
    hint: p.code,
    price: rialToToman(p.price).toString(),
  }));
}
