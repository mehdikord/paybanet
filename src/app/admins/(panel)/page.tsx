import { LayoutDashboardIcon } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "داشبورد",
};

async function Greeting() {
  const admin = await requireAdmin();
  return (
    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
      سلام، {admin.name}
    </h1>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Suspense fallback={<Skeleton className="h-9 w-56" />}>
        <Greeting />
      </Suspense>
      <p className="mt-2 text-muted-foreground">به پنل مدیریت پی با نت خوش آمدید.</p>

      <section
        aria-label="داشبورد"
        className="mt-8 flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center"
      >
        <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <LayoutDashboardIcon className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-bold">داشبورد هنوز خالی است</h2>
        <p className="mt-1 max-w-sm leading-7 text-muted-foreground">
          آمار فروشندگان، فاکتورها و پرداخت‌ها پس از راه‌اندازی بخش‌های بعدی اینجا نمایش داده می‌شود.
        </p>
      </section>
    </div>
  );
}
