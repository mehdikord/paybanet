"use client";

import { Trash2Icon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DeleteSellerDialog, type DeletableSeller } from "./delete-seller-dialog";

export function SellerDangerZone({ seller }: { seller: DeletableSeller }) {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="danger-title" className="rounded-2xl border border-destructive/30 bg-card p-5">
      <h2 id="danger-title" className="font-bold text-destructive">
        حذف فروشنده
      </h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        حساب فروشنده همراه با محصولات، مشتریان و فاکتورهایش برای همیشه حذف می‌شود.
      </p>
      <Button variant="destructive" className="mt-4 w-full" onClick={() => setOpen(true)}>
        <Trash2Icon />
        حذف این فروشنده
      </Button>
      <DeleteSellerDialog
        seller={seller}
        open={open}
        onOpenChange={setOpen}
        redirectTo="/admins/sellers"
      />
    </section>
  );
}
