import { SearchXIcon, StoreIcon, UserPlusIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listSellers, SELLERS_PER_PAGE, type SellerListItem } from "@/lib/data/sellers";
import { formatDate, formatNumber } from "@/lib/format";
import { toPersianDigits } from "@/lib/phone";
import { SellerRowActions } from "./seller-row-actions";
import { DataPagination } from "@/components/data/data-pagination";

function Ltr({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <span dir="ltr" className="tabular-nums">
      {toPersianDigits(value)}
    </span>
  );
}

function Counts({ counts }: { counts: SellerListItem["counts"] }) {
  const items = [
    { label: "محصول", value: counts.products },
    { label: "مشتری", value: counts.customers },
    { label: "فاکتور", value: counts.invoices },
  ];
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
      {items.map((item) => (
        <span key={item.label}>
          <span className="font-semibold text-foreground tabular-nums">{formatNumber(item.value)}</span>{" "}
          {item.label}
        </span>
      ))}
    </span>
  );
}

function rowActions(seller: SellerListItem) {
  return (
    <SellerRowActions
      seller={{ id: seller.id, name: seller.name, counts: seller.counts }}
      phone={seller.phone}
    />
  );
}

export async function SellersTable({ query, page }: { query: string; page: number }) {
  const { items, total, page: currentPage, pageCount } = await listSellers({ query, page });

  if (items.length === 0) {
    return query ? (
      <Empty className="rounded-2xl border border-dashed bg-card py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>فروشنده‌ای با «{query}» پیدا نشد</EmptyTitle>
          <EmptyDescription>عبارت دیگری را امتحان کنید یا جستجو را پاک کنید.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : (
      <Empty className="rounded-2xl border border-dashed bg-card py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <StoreIcon />
          </EmptyMedia>
          <EmptyTitle>هنوز فروشنده‌ای ثبت نشده</EmptyTitle>
          <EmptyDescription>
            اولین فروشنده را بسازید تا بتواند وارد پنلش شود و فاکتور صادر کند.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/admins/sellers/new">
              <UserPlusIcon />
              فروشنده جدید
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-11 ps-5">فروشنده</TableHead>
              <TableHead>شماره موبایل</TableHead>
              <TableHead className="hidden lg:table-cell">کد ملی</TableHead>
              <TableHead className="hidden lg:table-cell">کد اقتصادی</TableHead>
              <TableHead className="hidden xl:table-cell">اطلاعات ثبت‌شده</TableHead>
              <TableHead>تاریخ عضویت</TableHead>
              <TableHead className="w-14 pe-3">
                <span className="sr-only">عملیات</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell className="py-3 ps-5">
                  <Link
                    href={`/admins/sellers/${seller.id}`}
                    className="font-semibold underline-offset-4 hover:text-primary hover:underline"
                  >
                    {seller.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Ltr value={seller.phone} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Ltr value={seller.nationalCode} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Ltr value={seller.economicCode} />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <Counts counts={seller.counts} />
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(seller.createdAt)}</TableCell>
                <TableCell className="pe-3">{rowActions(seller)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {items.map((seller) => (
          <li key={seller.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/admins/sellers/${seller.id}`} className="block truncate font-semibold">
                  {seller.name}
                </Link>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  <Ltr value={seller.phone} />
                </p>
              </div>
              <div className="-me-2 -mt-1">{rowActions(seller)}</div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
              <Counts counts={seller.counts} />
              <span className="text-muted-foreground">{formatDate(seller.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>

      <DataPagination
        basePath="/admins/sellers"
        params={{ q: query }}
        page={currentPage}
        pageCount={pageCount}
        perPage={SELLERS_PER_PAGE}
        total={total}
        noun="فروشنده"
      />
    </div>
  );
}
