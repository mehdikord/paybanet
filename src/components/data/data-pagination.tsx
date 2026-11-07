import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

type Props = {
  basePath: string;
  /** Current list params (search, filters, sort) to keep on every page link. */
  params: Record<string, string | undefined>;
  page: number;
  pageCount: number;
  perPage: number;
  total: number;
  /** What is being counted, e.g. "مشتری". */
  noun: string;
};

function pageHref(basePath: string, params: Props["params"], page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Compact page list: 1 … 4 5 6 … 12 */
function pageList(page: number, pageCount: number): (number | "gap")[] {
  const sorted = [...new Set([1, pageCount, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

export function DataPagination({ basePath, params, page, pageCount, perPage, total, noun }: Props) {
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  const href = (p: number) => pageHref(basePath, params, p);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        نمایش {formatNumber(from)} تا {formatNumber(to)} از {formatNumber(total)} {noun}
      </p>

      {pageCount > 1 && (
        <nav aria-label="صفحه‌بندی" className="flex items-center gap-1">
          <PageButton href={href(page - 1)} disabled={page <= 1} label="صفحه قبل">
            <ChevronRightIcon />
          </PageButton>
          {pageList(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                asChild
                size="icon"
                variant={p === page ? "default" : "ghost"}
                className="tabular-nums"
              >
                <Link
                  href={href(p)}
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`صفحه ${formatNumber(p)}`}
                >
                  {formatNumber(p)}
                </Link>
              </Button>
            ),
          )}
          <PageButton href={href(page + 1)} disabled={page >= pageCount} label="صفحه بعد">
            <ChevronLeftIcon />
          </PageButton>
        </nav>
      )}
    </div>
  );
}

function PageButton({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <Button size="icon" variant="ghost" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <Button asChild size="icon" variant="ghost">
      <Link href={href} aria-label={label}>
        {children}
      </Link>
    </Button>
  );
}
