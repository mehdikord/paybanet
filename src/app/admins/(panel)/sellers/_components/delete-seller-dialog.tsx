"use client";

import { Trash2Icon, TriangleAlertIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatNumber } from "@/lib/format";
import { deleteSeller } from "../actions";

export type DeletableSeller = {
  id: string;
  name: string;
  counts: { products: number; customers: number; invoices: number };
};

type Props = {
  seller: DeletableSeller;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where to go after deleting (e.g. back to the list from the edit page). */
  redirectTo?: string;
};

export function DeleteSellerDialog({ seller, open, onOpenChange, redirectTo }: Props) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [isPending, startTransition] = useTransition();

  const { products, customers, invoices } = seller.counts;
  const hasData = products + customers + invoices > 0;
  const matches = confirmation.trim() === seller.name.trim();

  const handleOpenChange = (next: boolean) => {
    if (isPending) return;
    if (!next) setConfirmation("");
    onOpenChange(next);
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSeller(seller.id, confirmation);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setConfirmation("");
      onOpenChange(false);
      if (redirectTo) router.push(redirectTo);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="data-[size=default]:sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle>حذف فروشنده «{seller.name}»</AlertDialogTitle>
          <AlertDialogDescription>
            این کار برگشت‌پذیر نیست. حساب فروشنده و دسترسی او به پنل حذف می‌شود.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasData && (
          <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm">
            <p className="font-semibold text-destructive">این اطلاعات هم برای همیشه حذف می‌شود:</p>
            <ul className="mt-2 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "محصول", value: products },
                { label: "مشتری", value: customers },
                { label: "فاکتور", value: invoices },
              ].map((item) => (
                <li key={item.label} className="rounded-md bg-background py-2">
                  <span className="block text-lg font-bold tabular-nums">{formatNumber(item.value)}</span>
                  <span className="text-muted-foreground">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Field>
          <FieldLabel htmlFor={`confirm-${seller.id}`} className="font-normal">
            برای تأیید، نام فروشنده را بنویسید:
            <span className="font-semibold select-all">{seller.name}</span>
          </FieldLabel>
          <Input
            id={`confirm-${seller.id}`}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && matches && !isPending) handleDelete();
            }}
          />
        </Field>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>انصراف</AlertDialogCancel>
          <Button variant="destructive" disabled={!matches || isPending} onClick={handleDelete}>
            {isPending ? <Spinner /> : <Trash2Icon />}
            حذف فروشنده
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
