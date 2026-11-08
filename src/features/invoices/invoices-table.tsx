import { EyeIcon, FileTextIcon, SearchXIcon } from "lucide-react";

import { DataPagination } from "@/components/data/data-pagination";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  INVOICES_PER_PAGE,
  listInvoices,
  type InvoiceListItem,
  type InvoiceListParams,
} from "@/lib/data/invoices";
import { formatDate, formatNumber } from "@/lib/format";
import { formatToman } from "@/lib/money";
import { toPersianDigits } from "@/lib/phone";
import { isAdminScope, scopePaths, type SellerScope } from "@/features/seller-scope-paths";
import { InvoiceRowActions, NewInvoiceButton, PrintInvoiceButton } from "./invoice-actions";
import { InvoiceStatusBadge } from "./status-badge";

const invoiceNumber = (id: string) => toPersianDigits(id);

function Amount({ toman, className }: { toman: string; className?: string }) {
  return (
    <span className={`font-semibold tabular-nums ${className ?? ""}`}>
      {formatToman(toman)} <span className="text-xs font-normal text-muted-foreground">تومان</span>
    </span>
  );
}

function Actions({ invoice }: { invoice: InvoiceListItem }) {
  return (
    <div className="flex items-center justify-end">
      <PrintInvoiceButton invoiceId={invoice.id} number={invoiceNumber(invoice.id)} />
      <InvoiceRowActions
        invoiceId={invoice.id}
        number={invoiceNumber(invoice.id)}
        payLink={invoice.payLink}
        paid={invoice.paid}
      />
    </div>
  );
}

function Summary({
  summary,
  total,
}: {
  summary: Awaited<ReturnType<typeof listInvoices>>["summary"];
  total: number;
}) {
  const items = [
    { label: "فاکتورهای این فهرست", value: formatNumber(total), sub: null },
    {
      label: "پرداخت‌شده",
      value: <Amount toman={summary.paid.total} />,
      sub: `${formatNumber(summary.paid.count)} فاکتور`,
      tone: "text-primary",
    },
    {
      label: "در انتظار پرداخت",
      value: <Amount toman={summary.unpaid.total} />,
      sub: `${formatNumber(summary.unpaid.count)} فاکتور`,
      tone: "text-amber-700 dark:text-amber-300",
    },
  ];
  return (
    <dl className="grid divide-y rounded-2xl border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-x-reverse">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col-reverse gap-1 px-5 py-4">
          <dd className="text-lg">
            {item.value}
            {item.sub && <span className="ms-2 text-sm text-muted-foreground">{item.sub}</span>}
          </dd>
          <dt className={`text-sm ${item.tone ?? "text-muted-foreground"}`}>{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export async function InvoicesTable({ params, scope }: { params: InvoiceListParams; scope: SellerScope }) {
  const { items, total, sellerTotal, page, pageCount, summary } = await listInvoices(params, scope.sellerId);
  const admin = isAdminScope(scope);

  if (sellerTotal === 0) {
    return (
      <Empty className="rounded-2xl border border-dashed bg-card py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon />
          </EmptyMedia>
          <EmptyTitle>{admin ? "این فروشنده هنوز فاکتوری ندارد" : "هنوز فاکتوری صادر نکرده‌اید"}</EmptyTitle>
          <EmptyDescription>
            {admin
              ? "برای این فروشنده فاکتور صادر کنید؛ لینک پرداختش ساخته می‌شود تا برای مشتری فرستاده شود."
              : "اولین فاکتور را صادر کنید؛ لینک پرداختش ساخته می‌شود تا برای مشتری بفرستید."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewInvoiceButton />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <Summary summary={summary} total={total} />

      {items.length === 0 ? (
        <Empty className="rounded-2xl border border-dashed bg-card py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>فاکتوری با این جستجو و فیلترها پیدا نشد</EmptyTitle>
            <EmptyDescription>بازه تاریخ یا مبلغ را تغییر دهید، یا فیلترها را حذف کنید.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 ps-5">شماره</TableHead>
                  <TableHead>مشتری</TableHead>
                  <TableHead>تاریخ فاکتور</TableHead>
                  <TableHead>مبلغ</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead className="hidden xl:table-cell">بازدید لینک</TableHead>
                  <TableHead className="w-24 pe-3">
                    <span className="sr-only">عملیات</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="py-3 ps-5 font-semibold tabular-nums">
                      {invoiceNumber(invoice.id)}
                    </TableCell>
                    <TableCell className="max-w-56">
                      <p className="truncate font-medium">{invoice.customer.name}</p>
                      <p dir="ltr" className="text-end text-sm text-muted-foreground tabular-nums">
                        {toPersianDigits(invoice.customer.phone)}
                      </p>
                    </TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>
                      <Amount toman={invoice.total} />
                      <p className="text-xs text-muted-foreground">{formatNumber(invoice.itemCount)} قلم</p>
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge paid={invoice.paid} />
                      {invoice.paid && invoice.paidAt && (
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(invoice.paidAt)}</p>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums xl:table-cell">
                      <span className="inline-flex items-center gap-1">
                        <EyeIcon className="size-3.5" />
                        {formatNumber(invoice.linkViews)}
                      </span>
                    </TableCell>
                    <TableCell className="pe-3">
                      <Actions invoice={invoice} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-3 md:hidden">
            {items.map((invoice) => (
              <li key={invoice.id} className="rounded-2xl border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                      فاکتور <span className="font-semibold text-foreground tabular-nums">{invoiceNumber(invoice.id)}</span>
                      {" · "}
                      {formatDate(invoice.invoiceDate)}
                    </p>
                    <p className="mt-1 truncate font-semibold">{invoice.customer.name}</p>
                  </div>
                  <div className="-me-2 -mt-1">
                    <Actions invoice={invoice} />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                  <Amount toman={invoice.total} />
                  <InvoiceStatusBadge paid={invoice.paid} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {items.length > 0 && (
        <DataPagination
          basePath={scopePaths(scope).invoices}
          params={{
            q: params.q,
            status: params.status === "all" ? undefined : params.status,
            from: params.from ?? undefined,
            to: params.to ?? undefined,
            min: params.minAmount?.toString(),
            max: params.maxAmount?.toString(),
            sort: params.sort === "date_desc" ? undefined : params.sort,
          }}
          page={page}
          pageCount={pageCount}
          perPage={INVOICES_PER_PAGE}
          total={total}
          noun="فاکتور"
        />
      )}
    </div>
  );
}
