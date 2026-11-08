"use server";

import { refresh } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { resolveSellerId } from "@/lib/auth/seller-scope";
import { db } from "@/lib/db";
import type { MutationResult } from "@/lib/mutation";
import { customerSchema } from "@/lib/validations/customer";

const DUPLICATE_PHONE = "مشتری دیگری با این شماره موبایل دارید.";

function parseId(value: unknown): bigint | null {
  return typeof value === "string" && /^[1-9]\d{0,18}$/.test(value) ? BigInt(value) : null;
}

/** Creates a customer (id = null) or updates one of the seller's customers. */
export async function saveCustomer(
  scopeSellerId: string | null,
  customerId: string | null,
  input: unknown,
): Promise<MutationResult<"name" | "phone" | "economicCode" | "description">> {
  const sellerId = await resolveSellerId(scopeSellerId);

  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const id = customerId === null ? null : parseId(customerId);
  if (customerId !== null && !id) return { ok: false, message: "مشتری پیدا نشد." };

  const duplicate = await db.customer.findFirst({
    where: { sellerId, phone: data.phone, ...(id && { NOT: { id } }) },
    select: { id: true },
  });
  if (duplicate) return { ok: false, fieldErrors: { phone: [DUPLICATE_PHONE] } };

  try {
    if (id) {
      // Scoped by sellerId: a seller can never update another seller's customer.
      const result = await db.customer.updateMany({ where: { id, sellerId }, data });
      if (result.count === 0) return { ok: false, message: "این مشتری دیگر وجود ندارد." };
    } else {
      await db.customer.create({ data: { ...data, sellerId } });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, fieldErrors: { phone: [DUPLICATE_PHONE] } };
    }
    throw error;
  }

  refresh();
  return {
    ok: true,
    message: id ? `تغییرات «${data.name}» ذخیره شد.` : `مشتری «${data.name}» اضافه شد.`,
  };
}

/** Deletes a customer, unless they already appear on an invoice. */
export async function deleteCustomer(
  scopeSellerId: string | null,
  customerId: string,
): Promise<MutationResult> {
  const sellerId = await resolveSellerId(scopeSellerId);
  const id = parseId(customerId);
  if (!id) return { ok: false, message: "مشتری پیدا نشد." };

  const customer = await db.customer.findFirst({
    where: { id, sellerId },
    select: { name: true, _count: { select: { invoices: true } } },
  });
  if (!customer) return { ok: false, message: "این مشتری قبلاً حذف شده است." };
  if (customer._count.invoices > 0) {
    return {
      ok: false,
      message: `«${customer.name}» در فاکتورها استفاده شده و برای حفظ سابقه فاکتورها حذف نمی‌شود.`,
    };
  }

  try {
    await db.customer.deleteMany({ where: { id, sellerId } });
  } catch (error) {
    // An invoice was created for this customer in the meantime (FK RESTRICT).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { ok: false, message: `«${customer.name}» در فاکتورها استفاده شده و حذف نمی‌شود.` };
    }
    throw error;
  }

  refresh();
  return { ok: true, message: `مشتری «${customer.name}» حذف شد.` };
}
