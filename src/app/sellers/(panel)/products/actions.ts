"use server";

import { refresh } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { requireSellerId } from "@/lib/auth/seller";
import { db } from "@/lib/db";
import { tomanToRial } from "@/lib/money";
import type { MutationResult } from "@/lib/mutation";
import { productSchema } from "@/lib/validations/product";

const DUPLICATE_CODE = "محصول دیگری با این کد دارید.";

function parseId(value: unknown): bigint | null {
  return typeof value === "string" && /^[1-9]\d{0,18}$/.test(value) ? BigInt(value) : null;
}

/** Creates a product (id = null) or updates one of the seller's products. */
export async function saveProduct(
  productId: string | null,
  input: unknown,
): Promise<MutationResult<"name" | "code" | "price" | "description">> {
  const sellerId = await requireSellerId();

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { price, ...rest } = parsed.data;
  const data = { ...rest, price: tomanToRial(price) };

  const id = productId === null ? null : parseId(productId);
  if (productId !== null && !id) return { ok: false, message: "محصول پیدا نشد." };

  const duplicate = await db.product.findFirst({
    where: { sellerId, code: data.code, ...(id && { NOT: { id } }) },
    select: { id: true },
  });
  if (duplicate) return { ok: false, fieldErrors: { code: [DUPLICATE_CODE] } };

  try {
    if (id) {
      // Scoped by sellerId: a seller can never update another seller's product.
      // Past invoices keep their own price (orders.price), so editing is safe.
      const result = await db.product.updateMany({ where: { id, sellerId }, data });
      if (result.count === 0) return { ok: false, message: "این محصول دیگر وجود ندارد." };
    } else {
      await db.product.create({ data: { ...data, sellerId } });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, fieldErrors: { code: [DUPLICATE_CODE] } };
    }
    throw error;
  }

  refresh();
  return {
    ok: true,
    message: id ? `تغییرات «${data.name}» ذخیره شد.` : `محصول «${data.name}» اضافه شد.`,
  };
}

/** Deletes a product, unless it already appears on an invoice. */
export async function deleteProduct(productId: string): Promise<MutationResult> {
  const sellerId = await requireSellerId();
  const id = parseId(productId);
  if (!id) return { ok: false, message: "محصول پیدا نشد." };

  const product = await db.product.findFirst({
    where: { id, sellerId },
    select: { name: true, _count: { select: { orders: true } } },
  });
  if (!product) return { ok: false, message: "این محصول قبلاً حذف شده است." };
  if (product._count.orders > 0) {
    return {
      ok: false,
      message: `«${product.name}» در فاکتورها استفاده شده و برای حفظ سابقه فاکتورها حذف نمی‌شود.`,
    };
  }

  try {
    await db.product.deleteMany({ where: { id, sellerId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { ok: false, message: `«${product.name}» در فاکتورها استفاده شده و حذف نمی‌شود.` };
    }
    throw error;
  }

  refresh();
  return { ok: true, message: `محصول «${product.name}» حذف شد.` };
}
