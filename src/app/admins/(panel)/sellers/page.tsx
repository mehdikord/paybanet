import { UserPlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/panel/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/data/search-input";
import { SellersTable } from "./_components/sellers-table";

export const metadata: Metadata = {
  title: "فروشندگان",
};

async function SellersResults({ searchParams }: PageProps<"/admins/sellers">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const page = Number(typeof params.page === "string" ? params.page : 1) || 1;

  return <SellersTable query={query} page={page} />;
}

function TableSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5" aria-busy="true" aria-label="در حال بارگذاری">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default function SellersPage(props: PageProps<"/admins/sellers">) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="فروشندگان"
        description="فروشندگانی که از پی با نت فاکتور و لینک پرداخت صادر می‌کنند."
        actions={
          <Button asChild size="lg">
            <Link href="/admins/sellers/new">
              <UserPlusIcon />
              فروشنده جدید
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<div className="h-10 w-full sm:max-w-sm" />}>
        <SearchInput placeholder="جستجوی نام، موبایل، کد ملی یا اقتصادی" label="جستجوی فروشندگان" />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <SellersResults {...props} />
      </Suspense>
    </div>
  );
}
