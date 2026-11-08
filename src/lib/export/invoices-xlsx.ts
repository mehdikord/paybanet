/**
 * Builds the sellers' invoice report as a standard .xlsx workbook (RTL sheets,
 * header row frozen, auto-filter, real numeric cells for amounts).
 * Dates are written as Jalali text with Latin digits ("1405/08/17") so they
 * sort and filter correctly in Excel.
 */
import "server-only";

import ExcelJS from "exceljs";

import type { InvoiceExportRow, InvoiceListParams } from "@/lib/data/invoices";
import { formatJalaliDay } from "@/lib/format";
import { payLinkPath } from "@/lib/pay-link";

const jalaliParts = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Asia/Tehran",
});

function jalali(date: Date | null, withTime = false): string {
  if (!date) return "";
  const parts = Object.fromEntries(jalaliParts.formatToParts(date).map((p) => [p.type, p.value]));
  const day = `${parts.year}/${parts.month}/${parts.day}`;
  return withTime ? `${day} ${parts.hour}:${parts.minute}` : day;
}

const AMOUNT_FORMAT = "#,##0";
const HEADER_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F2A2E" } };
const TOTAL_FILL: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8F3F1" } };
const FONT = "Tahoma";

function styleTable(sheet: ExcelJS.Worksheet, rowCount: number) {
  const header = sheet.getRow(1);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font = { name: FONT, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = HEADER_FILL;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });
  for (let r = 2; r <= rowCount + 1; r++) {
    sheet.getRow(r).eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { ...cell.font, name: FONT };
      cell.alignment = { vertical: "middle" };
    });
  }
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
}

function addTotalRow(sheet: ExcelJS.Worksheet, values: Record<string, unknown>) {
  const row = sheet.addRow(values);
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { name: FONT, bold: true };
    cell.fill = TOTAL_FILL;
  });
}

const STATUS_LABEL: Record<InvoiceListParams["status"], string> = {
  all: "همه",
  paid: "پرداخت‌شده",
  unpaid: "پرداخت‌نشده",
};

const SORT_LABEL: Record<InvoiceListParams["sort"], string> = {
  date_desc: "تاریخ فاکتور (جدیدترین)",
  date_asc: "تاریخ فاکتور (قدیمی‌ترین)",
  amount_desc: "بیشترین مبلغ",
  amount_asc: "کمترین مبلغ",
  created_desc: "آخرین صادرشده",
};

const toman = (value: bigint) => Number(value);

export async function buildInvoicesWorkbook({
  sellerName,
  params,
  items,
  total,
  truncated,
  origin,
  generatedAt = new Date(),
}: {
  sellerName: string;
  params: InvoiceListParams;
  items: InvoiceExportRow[];
  total: number;
  truncated: boolean;
  origin: string;
  generatedAt?: Date;
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PayBaNet";
  workbook.created = generatedAt;
  const views: Partial<ExcelJS.WorksheetView>[] = [{ rightToLeft: true, state: "frozen", ySplit: 1 }];

  // ── Sheet 1: invoices ──────────────────────────────────────────────
  const invoices = workbook.addWorksheet("فاکتورها", { views });
  invoices.columns = [
    { header: "ردیف", key: "index", width: 7 },
    { header: "شماره فاکتور", key: "id", width: 13 },
    { header: "تاریخ فاکتور", key: "invoiceDate", width: 13 },
    { header: "تاریخ و ساعت ثبت", key: "createdAt", width: 18 },
    { header: "نام مشتری", key: "customerName", width: 24 },
    { header: "موبایل مشتری", key: "customerPhone", width: 15 },
    { header: "کد اقتصادی مشتری", key: "economicCode", width: 17 },
    { header: "تعداد اقلام", key: "itemCount", width: 10 },
    { header: "جمع تعداد کالا", key: "quantity", width: 12 },
    { header: "مبلغ کل (تومان)", key: "total", width: 18, style: { numFmt: AMOUNT_FORMAT } },
    { header: "وضعیت پرداخت", key: "status", width: 14 },
    { header: "تاریخ پرداخت", key: "paidDate", width: 13 },
    { header: "ساعت پرداخت", key: "paidTime", width: 11 },
    { header: "لینک پرداخت", key: "payLink", width: 45 },
    { header: "دفعات مشاهده لینک", key: "linkViews", width: 15 },
    { header: "آخرین ویرایش", key: "updatedAt", width: 18 },
  ];

  items.forEach((invoice, index) => {
    const paidAt = invoice.paid ? invoice.paidAt : null;
    const row = invoices.addRow({
      index: index + 1,
      id: Number(invoice.id),
      invoiceDate: jalali(invoice.invoiceDate),
      createdAt: jalali(invoice.createdAt, true),
      customerName: invoice.customer.name,
      customerPhone: invoice.customer.phone,
      economicCode: invoice.customer.economicCode ?? "",
      itemCount: invoice.items.length,
      quantity: invoice.items.reduce((sum, item) => sum + item.quantity, 0),
      total: toman(invoice.total),
      status: invoice.paid ? "پرداخت‌شده" : "پرداخت‌نشده",
      paidDate: jalali(paidAt),
      paidTime: paidAt ? jalali(paidAt, true).slice(11) : "",
      payLink: invoice.payLink ? `${origin}${payLinkPath(invoice.payLink)}` : "",
      linkViews: invoice.linkViews,
      updatedAt: jalali(invoice.updatedAt, true),
    });
    // Keep phone numbers as text (leading zero) and color the status.
    row.getCell("customerPhone").numFmt = "@";
    row.getCell("status").font = { name: FONT, bold: true, color: { argb: invoice.paid ? "FF0B7A6B" : "FFB4401C" } };
    if (invoice.payLink) {
      row.getCell("payLink").value = {
        text: `${origin}${payLinkPath(invoice.payLink)}`,
        hyperlink: `${origin}${payLinkPath(invoice.payLink)}`,
      };
    }
  });
  styleTable(invoices, items.length);

  const paidItems = items.filter((i) => i.paid);
  const sum = (list: InvoiceExportRow[]) => list.reduce((acc, i) => acc + i.total, BigInt(0));
  if (items.length > 0) {
    addTotalRow(invoices, { customerName: `جمع کل (${items.length} فاکتور)`, total: toman(sum(items)) });
  }

  // ── Sheet 2: line items ────────────────────────────────────────────
  const lines = workbook.addWorksheet("اقلام فاکتورها", { views });
  lines.columns = [
    { header: "شماره فاکتور", key: "id", width: 13 },
    { header: "تاریخ فاکتور", key: "invoiceDate", width: 13 },
    { header: "نام مشتری", key: "customerName", width: 24 },
    { header: "ردیف کالا", key: "line", width: 9 },
    { header: "کد کالا", key: "code", width: 14 },
    { header: "نام کالا", key: "name", width: 30 },
    { header: "تعداد", key: "quantity", width: 9 },
    { header: "قیمت واحد (تومان)", key: "price", width: 18, style: { numFmt: AMOUNT_FORMAT } },
    { header: "جمع ردیف (تومان)", key: "lineTotal", width: 18, style: { numFmt: AMOUNT_FORMAT } },
    { header: "وضعیت پرداخت", key: "status", width: 14 },
  ];
  let lineCount = 0;
  for (const invoice of items) {
    invoice.items.forEach((item, index) => {
      lineCount++;
      lines.addRow({
        id: Number(invoice.id),
        invoiceDate: jalali(invoice.invoiceDate),
        customerName: invoice.customer.name,
        line: index + 1,
        code: item.code,
        name: item.name,
        quantity: item.quantity,
        price: toman(item.price),
        lineTotal: toman(item.lineTotal),
        status: invoice.paid ? "پرداخت‌شده" : "پرداخت‌نشده",
      });
    });
  }
  styleTable(lines, lineCount);
  if (lineCount > 0) {
    addTotalRow(lines, {
      name: "جمع کل",
      quantity: items.reduce((acc, i) => acc + i.items.reduce((s, item) => s + item.quantity, 0), 0),
      lineTotal: toman(items.reduce((acc, i) => acc + i.items.reduce((s, item) => s + item.lineTotal, BigInt(0)), BigInt(0))),
    });
  }

  // ── Sheet 3: report summary & applied filters ─────────────────────
  const info = workbook.addWorksheet("مشخصات گزارش", { views: [{ rightToLeft: true }] });
  info.columns = [
    { key: "label", width: 26 },
    { key: "value", width: 40 },
  ];
  const filterRange = (from: string | null, to: string | null) =>
    from || to ? `${from ? `از ${formatJalaliDay(from)}` : ""} ${to ? `تا ${formatJalaliDay(to)}` : ""}`.trim() : "همه";
  const amountRange =
    params.minAmount !== null || params.maxAmount !== null
      ? `${params.minAmount !== null ? `از ${params.minAmount.toLocaleString("en-US")}` : ""} ${
          params.maxAmount !== null ? `تا ${params.maxAmount.toLocaleString("en-US")}` : ""
        } تومان`.trim()
      : "همه";

  const infoRows: [string, string | number][] = [
    ["گزارش فاکتورها", ""],
    ["فروشنده", sellerName],
    ["تاریخ تهیه گزارش", jalali(generatedAt, true)],
    ["", ""],
    ["فیلترهای اعمال‌شده", ""],
    ["جستجو", params.q || "—"],
    ["وضعیت پرداخت", STATUS_LABEL[params.status]],
    ["تاریخ فاکتور", filterRange(params.from, params.to)],
    ["مبلغ", amountRange],
    ["مرتب‌سازی", SORT_LABEL[params.sort]],
    ["", ""],
    ["خلاصه", ""],
    ["تعداد فاکتورها", items.length],
    ["مبلغ کل (تومان)", toman(sum(items))],
    ["تعداد پرداخت‌شده", paidItems.length],
    ["مبلغ پرداخت‌شده (تومان)", toman(sum(paidItems))],
    ["تعداد پرداخت‌نشده", items.length - paidItems.length],
    ["مبلغ پرداخت‌نشده (تومان)", toman(sum(items) - sum(paidItems))],
  ];
  if (truncated) {
    infoRows.push(["", ""], ["توجه", `فقط ${items.length} فاکتور از ${total} فاکتور در این فایل آمده است. فیلترها را محدودتر کنید.`]);
  }
  for (const [label, value] of infoRows) {
    const row = info.addRow({ label, value });
    row.getCell("label").font = { name: FONT, bold: true };
    row.getCell("value").font = { name: FONT };
    row.getCell("value").alignment = { horizontal: "right" };
    if (typeof value === "number") row.getCell("value").numFmt = AMOUNT_FORMAT;
    if (["گزارش فاکتورها", "فیلترهای اعمال‌شده", "خلاصه"].includes(label)) {
      row.getCell("label").font = { name: FONT, bold: true, size: 13, color: { argb: "FF0B7A6B" } };
    }
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
