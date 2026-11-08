import { SearchXIcon, UsersIcon } from "lucide-react";

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
  CUSTOMERS_PER_PAGE,
  listCustomers,
  type CustomerListItem,
  type CustomerListParams,
} from "@/lib/data/customers";
import { formatDate, formatNumber } from "@/lib/format";
import { toPersianDigits } from "@/lib/phone";
import { isAdminScope, scopePaths, type SellerScope } from "@/features/seller-scope-paths";
import { CustomerRowActions, NewCustomerButton } from "./customer-actions";

function Ltr({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <span dir="ltr" className="tabular-nums">
      {toPersianDigits(value)}
    </span>
  );
}

function Actions({ customer }: { customer: CustomerListItem }) {
  return (
    <CustomerRowActions
      invoiceCount={customer.invoiceCount}
      customer={{
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        economicCode: customer.economicCode ?? "",
        description: customer.description ?? "",
      }}
    />
  );
}

export async function CustomersTable({ params, scope }: { params: CustomerListParams; scope: SellerScope }) {
  const { items, total, sellerTotal, page, pageCount } = await listCustomers(params, scope.sellerId);
  const admin = isAdminScope(scope);

  if (sellerTotal === 0) {
    return (
      <Empty className="rounded-2xl border border-dashed bg-card py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>{admin ? "این فروشنده هنوز مشتری‌ای ندارد" : "هنوز مشتری‌ای ثبت نکرده‌اید"}</EmptyTitle>
          <EmptyDescription>
            {admin
              ? "برای این فروشنده مشتری ثبت کنید تا در فاکتورهایش قابل انتخاب باشد."
              : "مشتریانتان را ثبت کنید تا موقع صدور فاکتور فقط انتخابشان کنید."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewCustomerButton />
        </EmptyContent>
      </Empty>
    );
  }

  if (items.length === 0) {
    return (
      <Empty className="rounded-2xl border border-dashed bg-card py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>مشتری‌ای با این جستجو و فیلترها پیدا نشد</EmptyTitle>
          <EmptyDescription>عبارت جستجو را تغییر دهید یا فیلترها را حذف کنید.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 ps-5">مشتری</TableHead>
              <TableHead>شماره موبایل</TableHead>
              <TableHead className="hidden lg:table-cell">کد اقتصادی</TableHead>
              <TableHead>فاکتورها</TableHead>
              <TableHead className="hidden lg:table-cell">تاریخ ثبت</TableHead>
              <TableHead className="w-14 pe-3">
                <span className="sr-only">عملیات</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="max-w-72 py-3 ps-5">
                  <p className="truncate font-semibold">{customer.name}</p>
                  {customer.description && (
                    <p className="truncate text-sm text-muted-foreground" title={customer.description}>
                      {customer.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Ltr value={customer.phone} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Ltr value={customer.economicCode} />
                </TableCell>
                <TableCell className="tabular-nums">
                  {customer.invoiceCount > 0 ? (
                    formatNumber(customer.invoiceCount)
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {formatDate(customer.createdAt)}
                </TableCell>
                <TableCell className="pe-3">
                  <Actions customer={customer} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden">
        {items.map((customer) => (
          <li key={customer.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold">{customer.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  <Ltr value={customer.phone} />
                </p>
              </div>
              <div className="-me-2 -mt-1">
                <Actions customer={customer} />
              </div>
            </div>
            {customer.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{customer.description}</p>
            )}
            <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3 text-sm text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground tabular-nums">
                  {formatNumber(customer.invoiceCount)}
                </span>{" "}
                فاکتور
              </span>
              <span>{formatDate(customer.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>

      <DataPagination
        basePath={scopePaths(scope).customers}
        params={{
          q: params.q,
          invoices: params.invoices === "all" ? undefined : params.invoices,
          economic: params.economic === "all" ? undefined : params.economic,
          sort: params.sort === "newest" ? undefined : params.sort,
        }}
        page={page}
        pageCount={pageCount}
        perPage={CUSTOMERS_PER_PAGE}
        total={total}
        noun="مشتری"
      />
    </div>
  );
}
