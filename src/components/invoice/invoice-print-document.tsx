import { LogoMark } from "@/components/brand/logo";
import type { InvoiceDocument } from "@/lib/data/invoices";
import { formatShortDate } from "@/lib/format";
import { formatToman } from "@/lib/money";
import { payLinkPath } from "@/lib/pay-link";
import { numberToPersianWords } from "@/lib/persian-words";
import { toPersianDigits } from "@/lib/phone";

function Party({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string | null | undefined; ltr?: boolean }[];
}) {
  return (
    <section className="border border-black/70">
      <h2 className="border-b border-black/70 bg-black/[0.06] px-3 py-1.5 text-sm font-bold">{title}</h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-3 py-2.5 text-[13px]">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-1.5">
            <dt className="shrink-0 text-black/60">{row.label}:</dt>
            <dd dir={row.ltr ? "ltr" : undefined} className="font-medium">
              {row.value ? (row.ltr ? toPersianDigits(row.value) : row.value) : "—"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** A4 sales invoice («صورتحساب فروش کالا و خدمات»), black-on-white for printing. */
export function InvoicePrintDocument({ invoice, origin }: { invoice: InvoiceDocument; origin: string }) {
  const number = toPersianDigits(invoice.id);

  return (
    <article className="invoice-sheet mx-auto bg-white text-[13px] leading-6 text-black">
      <header className="flex items-start justify-between gap-6 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <LogoMark className="size-11" />
          <div>
            <p className="text-lg font-extrabold">{invoice.seller.name}</p>
            <p className="text-xs text-black/60">صادرشده در پی با نت</p>
          </div>
        </div>
        <h1 className="self-center text-xl font-extrabold">صورتحساب فروش کالا و خدمات</h1>
        <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-1 text-[13px]">
          <dt className="text-black/60">شماره فاکتور:</dt>
          <dd className="font-bold tabular-nums">{number}</dd>
          <dt className="text-black/60">تاریخ:</dt>
          <dd className="font-bold tabular-nums">{formatShortDate(invoice.invoiceDate)}</dd>
          <dt className="text-black/60">وضعیت:</dt>
          <dd className="font-bold">{invoice.paid ? "پرداخت‌شده" : "پرداخت‌نشده"}</dd>
        </dl>
      </header>

      <div className="mt-4 space-y-3">
        <Party
          title="مشخصات فروشنده"
          rows={[
            { label: "نام", value: invoice.seller.name },
            { label: "تلفن", value: invoice.seller.phone, ltr: true },
            { label: "کد ملی", value: invoice.seller.nationalCode, ltr: true },
            { label: "کد اقتصادی", value: invoice.seller.economicCode, ltr: true },
          ]}
        />
        <Party
          title="مشخصات خریدار"
          rows={[
            { label: "نام", value: invoice.customer.name },
            { label: "تلفن", value: invoice.customer.phone, ltr: true },
            { label: "کد اقتصادی", value: invoice.customer.economicCode, ltr: true },
            { label: "توضیحات", value: invoice.customer.description },
          ]}
        />
      </div>

      <table className="mt-4 w-full border-collapse text-[13px]">
        <thead>
          <tr className="bg-black/[0.06] [&>th]:border [&>th]:border-black/70 [&>th]:px-2 [&>th]:py-1.5 [&>th]:font-bold">
            <th className="w-10">ردیف</th>
            <th className="w-24">کد کالا</th>
            <th className="text-start">شرح کالا یا خدمات</th>
            <th className="w-16">تعداد</th>
            <th className="w-32">مبلغ واحد (تومان)</th>
            <th className="w-36">مبلغ کل (تومان)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="break-inside-avoid [&>td]:border [&>td]:border-black/70 [&>td]:px-2 [&>td]:py-1.5">
              <td className="text-center tabular-nums">{toPersianDigits(index + 1)}</td>
              <td dir="ltr" className="text-center font-mono text-xs">
                {item.code}
              </td>
              <td>
                {item.name}
                {item.description && <span className="block text-xs text-black/60">{item.description}</span>}
              </td>
              <td className="text-center tabular-nums">{toPersianDigits(item.quantity)}</td>
              <td className="text-center tabular-nums">{formatToman(item.price)}</td>
              <td className="text-center font-semibold tabular-nums">{formatToman(item.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="[&>td]:border [&>td]:border-black/70 [&>td]:px-2 [&>td]:py-2">
            <td colSpan={5} className="text-start font-bold">
              جمع کل قابل پرداخت
            </td>
            <td className="text-center text-base font-extrabold tabular-nums">{formatToman(invoice.total)}</td>
          </tr>
          <tr className="[&>td]:border [&>td]:border-black/70 [&>td]:px-2 [&>td]:py-2">
            <td colSpan={6}>
              <span className="text-black/60">مبلغ به حروف: </span>
              <span className="font-semibold">{numberToPersianWords(invoice.total)} تومان</span>
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-8 grid grid-cols-2 gap-6 text-center text-[13px]">
        <div className="h-28 border border-dashed border-black/50 p-2">مهر و امضای فروشنده</div>
        <div className="h-28 border border-dashed border-black/50 p-2">امضای خریدار</div>
      </div>

      {invoice.payLink && (
        <footer className="mt-6 border-t border-black/30 pt-3 text-xs text-black/70">
          لینک پرداخت آنلاین این فاکتور:{" "}
          <span dir="ltr" className="font-mono">
            {origin}
            {payLinkPath(invoice.payLink)}
          </span>
        </footer>
      )}
    </article>
  );
}
