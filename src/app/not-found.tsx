import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-black text-primary">۴۰۴</p>
      <h1 className="mt-4 text-xl font-bold">این صفحه پیدا نشد</h1>
      <p className="mt-2 text-muted-foreground">نشانی را بررسی کنید یا به پنل برگردید.</p>
      <Button asChild className="mt-6">
        <Link href="/admins">بازگشت به پنل</Link>
      </Button>
    </main>
  );
}
