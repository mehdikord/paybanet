import { PackageIcon, SearchXIcon } from "lucide-react";

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
import { formatDate, formatNumber } from "@/lib/format";
import {
  listProducts,
  PRODUCTS_PER_PAGE,
  type ProductListItem,
  type ProductListParams,
} from "@/lib/data/products";
import { formatToman } from "@/lib/money";
import { isAdminScope, scopePaths, type SellerScope } from "@/features/seller-scope-paths";
import { NewProductButton, ProductRowActions } from "./product-actions";

function Price({ toman }: { toman: string }) {
  return (
    <span className="font-semibold tabular-nums">
      {formatToman(toman)} <span className="text-xs font-normal text-muted-foreground">تومان</span>
    </span>
  );
}

function Code({ code }: { code: string }) {
  return (
    <span dir="ltr" className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
      {code}
    </span>
  );
}

function Actions({ product }: { product: ProductListItem }) {
  return (
    <ProductRowActions
      orderCount={product.orderCount}
      product={{
        id: product.id,
        name: product.name,
        code: product.code,
        price: product.price,
        description: product.description ?? "",
      }}
    />
  );
}

export async function ProductsTable({ params, scope }: { params: ProductListParams; scope: SellerScope }) {
  const { items, total, sellerTotal, page, pageCount } = await listProducts(params, scope.sellerId);
  const admin = isAdminScope(scope);

  if (sellerTotal === 0) {
    return (
      <Empty className="rounded-2xl border border-dashed bg-card py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageIcon />
          </EmptyMedia>
          <EmptyTitle>{admin ? "این فروشنده هنوز محصولی ندارد" : "هنوز محصولی ثبت نکرده‌اید"}</EmptyTitle>
          <EmptyDescription>
            {admin
              ? "محصولات و خدمات این فروشنده را با قیمت ثبت کنید تا در فاکتورهایش قابل انتخاب باشند."
              : "محصولات و خدماتتان را با قیمت ثبت کنید تا فاکتورها سریع‌تر صادر شوند."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewProductButton />
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
          <EmptyTitle>محصولی با این جستجو و فیلترها پیدا نشد</EmptyTitle>
          <EmptyDescription>عبارت جستجو یا بازه قیمت را تغییر دهید، یا فیلترها را حذف کنید.</EmptyDescription>
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
              <TableHead className="h-11 ps-5">محصول</TableHead>
              <TableHead>کد</TableHead>
              <TableHead>قیمت</TableHead>
              <TableHead className="hidden lg:table-cell">در فاکتورها</TableHead>
              <TableHead className="hidden lg:table-cell">تاریخ ثبت</TableHead>
              <TableHead className="w-14 pe-3">
                <span className="sr-only">عملیات</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="max-w-80 py-3 ps-5">
                  <p className="truncate font-semibold">{product.name}</p>
                  {product.description && (
                    <p className="truncate text-sm text-muted-foreground" title={product.description}>
                      {product.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <Code code={product.code} />
                </TableCell>
                <TableCell>
                  <Price toman={product.price} />
                </TableCell>
                <TableCell className="hidden tabular-nums lg:table-cell">
                  {product.orderCount > 0 ? (
                    `${formatNumber(product.orderCount)} بار`
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {formatDate(product.createdAt)}
                </TableCell>
                <TableCell className="pe-3">
                  <Actions product={product} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden">
        {items.map((product) => (
          <li key={product.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <p className="truncate font-semibold">{product.name}</p>
                <Code code={product.code} />
              </div>
              <div className="-me-2 -mt-1">
                <Actions product={product} />
              </div>
            </div>
            {product.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
            )}
            <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3 text-sm">
              <Price toman={product.price} />
              <span className="text-muted-foreground">{formatDate(product.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>

      <DataPagination
        basePath={scopePaths(scope).products}
        params={{
          q: params.q,
          min: params.minPrice?.toString(),
          max: params.maxPrice?.toString(),
          usage: params.usage === "all" ? undefined : params.usage,
          sort: params.sort === "newest" ? undefined : params.sort,
        }}
        page={page}
        pageCount={pageCount}
        perPage={PRODUCTS_PER_PAGE}
        total={total}
        noun="محصول"
      />
    </div>
  );
}
