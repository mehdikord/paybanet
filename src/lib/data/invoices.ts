/**
 * Invoice queries. Seller-facing functions are scoped to one seller: the
 * signed-in seller, or — when `sellerId` is passed — the seller an admin is
 * managing (see `resolveSellerId`). `getPublicInvoice` is the only
 * unauthenticated read (by pay-link token).
 */
import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { resolveSellerId } from "@/lib/auth/seller-scope";
import { endOfTehranDay, isIsoDay, startOfTehranDay, toTehranIsoDay } from "@/lib/dates";
import { db } from "@/lib/db";
import { rialToToman, tomanToRial } from "@/lib/money";
import { PAY_LINK_REGEX } from "@/lib/pay-link";
import { toLatinDigits } from "@/lib/phone";
import {
  getEnum,
  getNonNegativeInt,
  getPage,
  getString,
  paginate,
  type RawSearchParams,
} from "./list-params";

export const INVOICES_PER_PAGE = 15;

export const INVOICE_SORTS = ["date_desc", "date_asc", "amount_desc", "amount_asc", "created_desc"] as const;
export const INVOICE_STATUSES = ["all", "paid", "unpaid"] as const;

export type InvoiceListParams = {
  q: string;
  status: (typeof INVOICE_STATUSES)[number];
  /** Gregorian "YYYY-MM-DD" (inclusive), on invoice_date. */
  from: string | null;
  to: string | null;
  /** Toman. */
  minAmount: number | null;
  maxAmount: number | null;
  sort: (typeof INVOICE_SORTS)[number];
  page: number;
};

export type InvoiceListItem = {
  id: string;
  customer: { id: string; name: string; phone: string };
  invoiceDate: Date | null;
  /** Toman as string. */
  total: string;
  paid: boolean;
  paidAt: Date | null;
  payLink: string | null;
  linkViews: number;
  itemCount: number;
};

export function parseInvoiceListParams(params: RawSearchParams): InvoiceListParams {
  const day = (key: string) => {
    const value = getString(params, key, 10);
    return isIsoDay(value) ? value : null;
  };
  return {
    q: getString(params, "q"),
    status: getEnum(params, "status", INVOICE_STATUSES),
    from: day("from"),
    to: day("to"),
    minAmount: getNonNegativeInt(params, "min"),
    maxAmount: getNonNegativeInt(params, "max"),
    sort: getEnum(params, "sort", INVOICE_SORTS),
    page: getPage(params),
  };
}

const orderBy: Record<InvoiceListParams["sort"], Prisma.InvoiceOrderByWithRelationInput[]> = {
  date_desc: [{ invoiceDate: "desc" }, { id: "desc" }],
  date_asc: [{ invoiceDate: "asc" }, { id: "asc" }],
  amount_desc: [{ totalPrice: "desc" }, { id: "desc" }],
  amount_asc: [{ totalPrice: "asc" }, { id: "desc" }],
  created_desc: [{ id: "desc" }],
};

function buildWhere(sellerId: bigint, params: InvoiceListParams): Prisma.InvoiceWhereInput {
  const q = toLatinDigits(params.q).replace(/^#/, "");
  const invoiceDate: Prisma.DateTimeNullableFilter = {};
  if (params.from) invoiceDate.gte = startOfTehranDay(params.from);
  if (params.to) invoiceDate.lte = endOfTehranDay(params.to);
  const totalPrice: Prisma.BigIntFilter = {};
  if (params.minAmount !== null) totalPrice.gte = tomanToRial(params.minAmount);
  if (params.maxAmount !== null) totalPrice.lte = tomanToRial(params.maxAmount);

  return {
    sellerId,
    ...(q && {
      OR: /^\d{1,18}$/.test(q)
        ? [
            // Digits: invoice number or pay-link token; a phone fragment only
            // when long enough not to drown the invoice-number match.
            { id: BigInt(q) },
            { payLink: q },
            ...(q.length >= 4 ? [{ customer: { phone: { contains: q } } }] : []),
          ]
        : [{ customer: { name: { contains: q } } }, { customer: { phone: { contains: q } } }],
    }),
    ...(params.status === "paid" && { paid: true }),
    ...(params.status === "unpaid" && { paid: false }),
    ...(Object.keys(invoiceDate).length > 0 && { invoiceDate }),
    ...(Object.keys(totalPrice).length > 0 && { totalPrice }),
  };
}

export async function listInvoices(params: InvoiceListParams, scopeSellerId?: string | null) {
  const sellerId = await resolveSellerId(scopeSellerId);
  const where = buildWhere(sellerId, params);

  const [total, sellerTotal, byStatus] = await Promise.all([
    db.invoice.count({ where }),
    db.invoice.count({ where: { sellerId } }),
    db.invoice.groupBy({ by: ["paid"], where, _sum: { totalPrice: true }, _count: true }),
  ]);
  const { page, pageCount, skip, take } = paginate(total, params.page, INVOICES_PER_PAGE);

  const rows = await db.invoice.findMany({
    where,
    orderBy: orderBy[params.sort],
    skip,
    take,
    select: {
      id: true,
      invoiceDate: true,
      totalPrice: true,
      paid: true,
      paidAt: true,
      payLink: true,
      linkViews: true,
      customer: { select: { id: true, name: true, phone: true } },
      _count: { select: { orders: true } },
    },
  });

  const items: InvoiceListItem[] = rows.map((row) => ({
    id: row.id.toString(),
    customer: { ...row.customer, id: row.customer.id.toString() },
    invoiceDate: row.invoiceDate,
    total: rialToToman(row.totalPrice).toString(),
    paid: row.paid,
    paidAt: row.paidAt,
    payLink: row.payLink,
    linkViews: row.linkViews,
    itemCount: row._count.orders,
  }));

  const summaryFor = (paid: boolean) => {
    const group = byStatus.find((g) => g.paid === paid);
    return {
      count: group?._count ?? 0,
      total: rialToToman(group?._sum.totalPrice ?? BigInt(0)).toString(),
    };
  };

  return {
    items,
    total,
    sellerTotal,
    page,
    pageCount,
    summary: { paid: summaryFor(true), unpaid: summaryFor(false) },
  };
}

/** Safety cap for one export file (all filtered rows, not just one page). */
export const INVOICE_EXPORT_LIMIT = 20_000;

export type InvoiceExportRow = {
  id: string;
  invoiceDate: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  customer: { name: string; phone: string; economicCode: string | null };
  /** Toman. */
  total: bigint;
  paid: boolean;
  paidAt: Date | null;
  payLink: string | null;
  linkViews: number;
  items: { code: string; name: string; quantity: number; price: bigint; lineTotal: bigint }[];
};

/**
 * Every invoice matching the list filters and sort (pagination ignored), with
 * line items — for the Excel report. Seller-scoped.
 */
export async function listInvoicesForExport(params: InvoiceListParams, scopeSellerId?: string | null) {
  const sellerId = await resolveSellerId(scopeSellerId);
  const where = buildWhere(sellerId, params);

  const [seller, total, rows] = await Promise.all([
    db.seller.findUniqueOrThrow({ where: { id: sellerId }, select: { name: true } }),
    db.invoice.count({ where }),
    db.invoice.findMany({
      where,
      orderBy: orderBy[params.sort],
      take: INVOICE_EXPORT_LIMIT,
      select: {
        id: true,
        invoiceDate: true,
        createdAt: true,
        updatedAt: true,
        totalPrice: true,
        paid: true,
        paidAt: true,
        payLink: true,
        linkViews: true,
        customer: { select: { name: true, phone: true, economicCode: true } },
        orders: {
          orderBy: { id: "asc" },
          select: { quantity: true, price: true, product: { select: { code: true, name: true } } },
        },
      },
    }),
  ]);

  const items: InvoiceExportRow[] = rows.map((row) => ({
    id: row.id.toString(),
    invoiceDate: row.invoiceDate ?? row.createdAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customer: row.customer,
    total: rialToToman(row.totalPrice),
    paid: row.paid,
    paidAt: row.paidAt,
    payLink: row.payLink,
    linkViews: row.linkViews,
    items: row.orders.map((order) => ({
      code: order.product.code,
      name: order.product.name,
      quantity: order.quantity,
      price: rialToToman(order.price),
      lineTotal: rialToToman(order.price * BigInt(order.quantity)),
    })),
  }));

  return { seller, items, total, truncated: total > items.length };
}

export type InvoiceDetail = {
  id: string;
  customerId: string;
  customerName: string;
  /** "YYYY-MM-DD" (Tehran calendar day). */
  invoiceDate: string;
  items: { productId: string; productName: string; quantity: number; price: string }[];
};

/** Full invoice for the edit form (seller-scoped). */
export async function getInvoiceForEdit(
  invoiceId: bigint,
  scopeSellerId?: string | null,
): Promise<InvoiceDetail | null> {
  const sellerId = await resolveSellerId(scopeSellerId);
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, sellerId },
    select: {
      id: true,
      invoiceDate: true,
      createdAt: true,
      customer: { select: { id: true, name: true } },
      orders: {
        orderBy: { id: "asc" },
        select: { quantity: true, price: true, product: { select: { id: true, name: true } } },
      },
    },
  });
  if (!invoice) return null;

  return {
    id: invoice.id.toString(),
    customerId: invoice.customer.id.toString(),
    customerName: invoice.customer.name,
    invoiceDate: toTehranIsoDay(invoice.invoiceDate ?? invoice.createdAt ?? new Date()),
    items: invoice.orders.map((order) => ({
      productId: order.product.id.toString(),
      productName: order.product.name,
      quantity: order.quantity,
      price: rialToToman(order.price).toString(),
    })),
  };
}

/** Everything needed to render an invoice document (print / payment page). */
const documentSelect = {
  id: true,
  invoiceDate: true,
  createdAt: true,
  totalPrice: true,
  paid: true,
  paidAt: true,
  payLink: true,
  seller: { select: { name: true, phone: true, nationalCode: true, economicCode: true } },
  customer: { select: { name: true, phone: true, economicCode: true, description: true } },
  orders: {
    orderBy: { id: "asc" as const },
    select: {
      quantity: true,
      price: true,
      product: { select: { name: true, code: true, description: true } },
    },
  },
} satisfies Prisma.InvoiceSelect;

type DocumentRow = Prisma.InvoiceGetPayload<{ select: typeof documentSelect }>;

export type InvoiceDocument = {
  id: string;
  invoiceDate: Date | null;
  /** Toman as string. */
  total: string;
  paid: boolean;
  paidAt: Date | null;
  payLink: string | null;
  seller: DocumentRow["seller"];
  customer: DocumentRow["customer"];
  items: { name: string; code: string; description: string | null; quantity: number; price: string; lineTotal: string }[];
};

function toDocument(row: DocumentRow): InvoiceDocument {
  return {
    id: row.id.toString(),
    invoiceDate: row.invoiceDate ?? row.createdAt,
    total: rialToToman(row.totalPrice).toString(),
    paid: row.paid,
    paidAt: row.paidAt,
    payLink: row.payLink,
    seller: row.seller,
    customer: row.customer,
    items: row.orders.map((order) => ({
      name: order.product.name,
      code: order.product.code,
      description: order.product.description,
      quantity: order.quantity,
      price: rialToToman(order.price).toString(),
      lineTotal: rialToToman(order.price * BigInt(order.quantity)).toString(),
    })),
  };
}

/** Invoice document for printing (seller-scoped). */
export async function getInvoiceDocument(
  invoiceId: bigint,
  scopeSellerId?: string | null,
): Promise<InvoiceDocument | null> {
  const sellerId = await resolveSellerId(scopeSellerId);
  const row = await db.invoice.findFirst({ where: { id: invoiceId, sellerId }, select: documentSelect });
  return row ? toDocument(row) : null;
}

/**
 * Public: invoice by payment-link token. Read-only — the page may render more
 * than once per request, so views are recorded from the browser instead
 * (see `recordPaymentView`).
 */
export async function getPublicInvoice(token: string): Promise<InvoiceDocument | null> {
  if (!PAY_LINK_REGEX.test(token)) return null;
  const row = await db.invoice.findUnique({ where: { payLink: token }, select: documentSelect });
  return row ? toDocument(row) : null;
}
