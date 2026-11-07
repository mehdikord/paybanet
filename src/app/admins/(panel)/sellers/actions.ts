"use server";

import bcrypt from "bcryptjs";
import { refresh } from "next/cache";

import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { parseSellerId } from "@/lib/data/sellers";
import { db } from "@/lib/db";
import {
  createSellerSchema,
  sellerFormDataToObject,
  updateSellerSchema,
  type SellerActionState,
} from "@/lib/validations/seller";

const BCRYPT_ROUNDS = 12;
const DUPLICATE_PHONE = "این شماره موبایل برای فروشنده دیگری ثبت شده است.";

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function validationError(error: { flatten: () => { fieldErrors: SellerActionState["fieldErrors"] } }) {
  return {
    ok: false,
    message: "لطفاً خطاهای فرم را برطرف کنید.",
    fieldErrors: error.flatten().fieldErrors,
  } satisfies SellerActionState;
}

export async function createSeller(
  _prev: SellerActionState,
  formData: FormData,
): Promise<SellerActionState & { id?: string }> {
  await requireAdmin();

  const parsed = createSellerSchema.safeParse(sellerFormDataToObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  const { name, phone, password, nationalCode, economicCode } = parsed.data;

  const exists = await db.seller.findUnique({ where: { phone }, select: { id: true } });
  if (exists) return { ok: false, fieldErrors: { phone: [DUPLICATE_PHONE] } };

  try {
    const seller = await db.seller.create({
      data: {
        name,
        phone,
        nationalCode,
        economicCode,
        password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      },
      select: { id: true },
    });
    return { ok: true, id: seller.id.toString(), message: `فروشنده «${name}» ساخته شد.` };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, fieldErrors: { phone: [DUPLICATE_PHONE] } };
    throw error;
  }
}

export async function updateSeller(
  sellerId: string,
  _prev: SellerActionState,
  formData: FormData,
): Promise<SellerActionState> {
  await requireAdmin();

  const id = parseSellerId(sellerId);
  if (!id) return { ok: false, message: "فروشنده پیدا نشد." };

  const parsed = updateSellerSchema.safeParse(sellerFormDataToObject(formData));
  if (!parsed.success) return validationError(parsed.error);
  const { name, phone, password, nationalCode, economicCode } = parsed.data;

  const duplicate = await db.seller.findFirst({
    where: { phone, NOT: { id } },
    select: { id: true },
  });
  if (duplicate) return { ok: false, fieldErrors: { phone: [DUPLICATE_PHONE] } };

  try {
    const result = await db.seller.updateMany({
      where: { id },
      data: {
        name,
        phone,
        nationalCode,
        economicCode,
        ...(password ? { password: await bcrypt.hash(password, BCRYPT_ROUNDS) } : {}),
      },
    });
    if (result.count === 0) return { ok: false, message: "این فروشنده دیگر وجود ندارد." };
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, fieldErrors: { phone: [DUPLICATE_PHONE] } };
    throw error;
  }

  refresh();
  return {
    ok: true,
    message: password ? "تغییرات و رمز عبور جدید ذخیره شد." : "تغییرات ذخیره شد.",
  };
}

/**
 * Deletes a seller and everything that belongs to them, in one transaction:
 * invoices (and their orders, by cascade) first — because customers and products
 * referenced by invoices/orders are protected — then the seller
 * (products and customers go by cascade).
 */
export async function deleteSeller(
  sellerId: string,
  confirmationName: string,
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();

  const id = parseSellerId(sellerId);
  if (!id) return { ok: false, message: "فروشنده پیدا نشد." };

  const seller = await db.seller.findUnique({ where: { id }, select: { name: true } });
  if (!seller) return { ok: false, message: "این فروشنده قبلاً حذف شده است." };

  if (confirmationName.trim() !== seller.name.trim()) {
    return { ok: false, message: "نام واردشده با نام فروشنده یکسان نیست." };
  }

  await db.$transaction([
    db.invoice.deleteMany({ where: { sellerId: id } }),
    db.seller.delete({ where: { id } }),
  ]);

  refresh();
  return { ok: true, message: `فروشنده «${seller.name}» و همه اطلاعاتش حذف شد.` };
}
