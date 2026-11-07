/**
 * Seller dashboard figures. All amounts are returned in Toman (as strings).
 */
import "server-only";

import { requireSellerId } from "@/lib/auth/seller";
import { APP_TIME_ZONE } from "@/lib/dates";
import { db } from "@/lib/db";
import { rialToToman } from "@/lib/money";

const MONTHS = 6;

const jalaliParts = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "numeric",
});

/** Jalali { year, month } of an instant, in Tehran. */
function jalaliYearMonth(date: Date) {
  const parts = jalaliParts.formatToParts(date);
  return {
    year: Number(parts.find((p) => p.type === "year")?.value),
    month: Number(parts.find((p) => p.type === "month")?.value),
  };
}

const monthKey = (ym: { year: number; month: number }) => `${ym.year}-${ym.month}`;

export type MonthlyPoint = { key: string; label: string; paid: string; unpaid: string };

export async function getSellerDashboard() {
  const sellerId = await requireSellerId();
  const now = new Date();
  const current = jalaliYearMonth(now);

  // Last N Jalali months, oldest first.
  const months: { year: number; month: number }[] = [];
  for (let i = MONTHS - 1; i >= 0; i--) {
    let month = current.month - i;
    let year = current.year;
    while (month < 1) {
      month += 12;
      year -= 1;
    }
    months.push({ year, month });
  }
  // A safe lower bound (Jalali months are ≤ 31 days); exact bucketing happens below.
  const since = new Date(now.getTime() - (MONTHS * 31 + 1) * 24 * 60 * 60 * 1000);

  const [customers, products, byStatus, views, recentRows, windowRows] = await Promise.all([
    db.customer.count({ where: { sellerId } }),
    db.product.count({ where: { sellerId } }),
    db.invoice.groupBy({ by: ["paid"], where: { sellerId }, _count: true, _sum: { totalPrice: true } }),
    db.invoice.aggregate({ where: { sellerId }, _sum: { linkViews: true } }),
    db.invoice.findMany({
      where: { sellerId },
      orderBy: { id: "desc" },
      take: 6,
      select: {
        id: true,
        invoiceDate: true,
        totalPrice: true,
        paid: true,
        customer: { select: { name: true } },
      },
    }),
    db.invoice.findMany({
      where: { sellerId, OR: [{ invoiceDate: { gte: since } }, { paidAt: { gte: since } }] },
      select: { invoiceDate: true, totalPrice: true, paid: true, paidAt: true },
    }),
  ]);

  const status = (paid: boolean) => {
    const group = byStatus.find((g) => g.paid === paid);
    return { count: group?._count ?? 0, rial: group?._sum.totalPrice ?? BigInt(0) };
  };
  const paid = status(true);
  const unpaid = status(false);
  const totalRial = paid.rial + unpaid.rial;

  // Monthly buckets by invoice date; "received this month" by payment date.
  const buckets = new Map(months.map((m) => [monthKey(m), { paid: BigInt(0), unpaid: BigInt(0) }]));
  let receivedThisMonth = BigInt(0);
  let issuedThisMonth = 0;
  const currentKey = monthKey(current);
  for (const row of windowRows) {
    if (row.invoiceDate) {
      const key = monthKey(jalaliYearMonth(row.invoiceDate));
      const bucket = buckets.get(key);
      if (bucket) {
        if (row.paid) bucket.paid += row.totalPrice;
        else bucket.unpaid += row.totalPrice;
      }
      if (key === currentKey) issuedThisMonth++;
    }
    if (row.paid && row.paidAt && monthKey(jalaliYearMonth(row.paidAt)) === currentKey) {
      receivedThisMonth += row.totalPrice;
    }
  }

  const monthly: MonthlyPoint[] = months.map((m) => {
    const bucket = buckets.get(monthKey(m))!;
    return {
      key: monthKey(m),
      label: JALALI_MONTHS[m.month - 1],
      paid: rialToToman(bucket.paid).toString(),
      unpaid: rialToToman(bucket.unpaid).toString(),
    };
  });

  return {
    customers,
    products,
    invoices: { total: paid.count + unpaid.count, paid: paid.count, unpaid: unpaid.count, issuedThisMonth },
    amounts: {
      paid: rialToToman(paid.rial).toString(),
      unpaid: rialToToman(unpaid.rial).toString(),
      total: rialToToman(totalRial).toString(),
      receivedThisMonth: rialToToman(receivedThisMonth).toString(),
      /** Share of the invoiced amount that has been paid, 0–100. */
      collectionRate: totalRial > BigInt(0) ? Number((paid.rial * BigInt(1000)) / totalRial) / 10 : 0,
    },
    linkViews: views._sum.linkViews ?? 0,
    currentMonthName: JALALI_MONTHS[current.month - 1],
    monthly,
    recent: recentRows.map((row) => ({
      id: row.id.toString(),
      customerName: row.customer.name,
      invoiceDate: row.invoiceDate,
      total: rialToToman(row.totalPrice).toString(),
      paid: row.paid,
    })),
  };
}

const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
