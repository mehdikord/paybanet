import { FileTextIcon, PackageIcon, UserCogIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

import type { SellerDetail } from "@/lib/data/sellers";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export type SellerSection = "profile" | "products" | "customers" | "invoices";

/** Tabs between a seller's account, products, customers and invoices (admin panel). */
export function SellerSectionNav({
  seller,
  current,
}: {
  seller: Pick<SellerDetail, "id" | "counts">;
  current: SellerSection;
}) {
  const base = `/admins/sellers/${seller.id}`;
  const tabs = [
    { key: "profile", label: "اطلاعات فروشنده", href: base, icon: UserCogIcon, count: null },
    { key: "products", label: "محصولات", href: `${base}/products`, icon: PackageIcon, count: seller.counts.products },
    { key: "customers", label: "مشتریان", href: `${base}/customers`, icon: UsersIcon, count: seller.counts.customers },
    { key: "invoices", label: "فاکتورها", href: `${base}/invoices`, icon: FileTextIcon, count: seller.counts.invoices },
  ] as const;

  return (
    <nav aria-label="بخش‌های فروشنده" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1 rounded-xl border bg-card p-1 sm:w-fit">
        {tabs.map((tab) => {
          const active = tab.key === current;
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <tab.icon className="size-4" />
                {tab.label}
                {tab.count !== null && (
                  <span
                    className={cn(
                      "rounded-md px-1.5 text-xs tabular-nums",
                      active ? "bg-primary-foreground/20" : "bg-muted",
                    )}
                  >
                    {formatNumber(tab.count)}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
