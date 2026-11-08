"use server";

import { isIsoDay, startOfTehranDay, todayIsoDay } from "@/lib/dates";
import { db } from "@/lib/db";
import { PAY_LINK_REGEX } from "@/lib/pay-link";

export type PayResult = { ok: boolean; paidAt?: string; message?: string };

/**
 * The payment instant for a chosen Tehran calendar day: today → now; another
 * day → that day at the current Tehran time of day (so the time stays realistic).
 */
function paidAtFor(paidDay: string, now: Date) {
  const today = todayIsoDay();
  if (paidDay === today) return now;
  const timeOfDay = now.getTime() - startOfTehranDay(today).getTime();
  return new Date(startOfTehranDay(paidDay).getTime() + timeOfDay);
}

/**
 * TEST payment: marks the invoice as paid without a gateway, on the payment
 * day picked on the page (Gregorian "YYYY-MM-DD"; defaults to today, never in the future).
 * Replace with: create gateway transaction → redirect → verify callback → mark paid.
 */
export async function payInvoice(token: string, paidDay?: string): Promise<PayResult> {
  if (!PAY_LINK_REGEX.test(token)) return { ok: false, message: "لینک پرداخت معتبر نیست." };

  const day = paidDay ?? todayIsoDay();
  if (!isIsoDay(day)) return { ok: false, message: "تاریخ پرداخت معتبر نیست." };
  if (day > todayIsoDay()) return { ok: false, message: "تاریخ پرداخت نمی‌تواند بعد از امروز باشد." };

  const paidAt = paidAtFor(day, new Date());
  // Conditional update: a second click (or a race) can never pay twice or move paid_at.
  const result = await db.invoice.updateMany({
    where: { payLink: token, paid: false },
    data: { paid: true, paidAt },
  });

  if (result.count === 1) return { ok: true, paidAt: paidAt.toISOString() };

  const invoice = await db.invoice.findUnique({
    where: { payLink: token },
    select: { paid: true, paidAt: true },
  });
  if (!invoice) return { ok: false, message: "این فاکتور دیگر وجود ندارد." };
  return { ok: true, paidAt: invoice.paidAt?.toISOString(), message: "این فاکتور قبلاً پرداخت شده است." };
}

/** Counts one opening of the payment page (called once from the browser). */
export async function recordPaymentView(token: string): Promise<void> {
  if (!PAY_LINK_REGEX.test(token)) return;
  // Raw SQL so a view does not bump `updated_at` (Prisma's @updatedAt would).
  await db.$executeRaw`UPDATE invoices SET link_views = link_views + 1 WHERE pay_link = ${token}`;
}
