"use client";

import {
  CopyIcon,
  EllipsisVerticalIcon,
  ExternalLinkIcon,
  FilePlusIcon,
  PencilIcon,
  PrinterIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDeleteDialog } from "@/components/data/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { payLinkPath } from "@/lib/pay-link";
import { useSellerScope } from "@/features/seller-scope";
import { scopePaths } from "@/features/seller-scope-paths";
import { deleteInvoice } from "./actions";
import { InvoiceFormDialog } from "./invoice-form-dialog";

export function NewInvoiceButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        <FilePlusIcon />
        فاکتور جدید
      </Button>
      <InvoiceFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function PrintInvoiceButton({ invoiceId, number }: { invoiceId: string; number: string }) {
  const printPath = scopePaths(useSellerScope()).invoicePrint;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" asChild>
          <a href={printPath(invoiceId)} target="_blank" rel="noreferrer" aria-label={`پرینت فاکتور ${number}`}>
            <PrinterIcon />
          </a>
        </Button>
      </TooltipTrigger>
      <TooltipContent>پرینت فاکتور</TooltipContent>
    </Tooltip>
  );
}

export function InvoiceRowActions({
  invoiceId,
  number,
  payLink,
  paid,
}: {
  invoiceId: string;
  number: string;
  payLink: string | null;
  paid: boolean;
}) {
  const scope = useSellerScope();
  const printPath = scopePaths(scope).invoicePrint;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const copyLink = async () => {
    if (!payLink) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${payLinkPath(payLink)}`);
      toast.success("لینک پرداخت کپی شد.");
    } catch {
      toast.error("کپی انجام نشد.");
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`عملیات فاکتور ${number}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <PencilIcon />
            ویرایش
          </DropdownMenuItem>
          {payLink && (
            <>
              <DropdownMenuItem onSelect={copyLink}>
                <CopyIcon />
                کپی لینک پرداخت
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={payLinkPath(payLink)} target="_blank" rel="noreferrer">
                  <ExternalLinkIcon />
                  باز کردن صفحه پرداخت
                </a>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem asChild>
            <a href={printPath(invoiceId)} target="_blank" rel="noreferrer">
              <PrinterIcon />
              پرینت فاکتور
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2Icon />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InvoiceFormDialog open={editOpen} onOpenChange={setEditOpen} invoiceId={invoiceId} />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`حذف فاکتور شماره ${number}`}
        description={
          paid
            ? "این فاکتور پرداخت شده است. با حذف، فاکتور و لینک پرداختش برای همیشه حذف می‌شود."
            : "فاکتور و لینک پرداختش برای همیشه حذف می‌شود. این کار برگشت‌پذیر نیست."
        }
        onConfirm={() => deleteInvoice(scope.sellerId, invoiceId)}
      />
    </>
  );
}
