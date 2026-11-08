"use client";

import { CopyIcon, EllipsisVerticalIcon, PencilIcon, Trash2Icon, UserPlusIcon } from "lucide-react";
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
import { formatNumber } from "@/lib/format";
import { useSellerScope } from "@/features/seller-scope";
import { deleteCustomer } from "./actions";
import { CustomerFormDialog, type EditableCustomer } from "./customer-form-dialog";

export function NewCustomerButton({ variant = "default" }: { variant?: "default" | "outline" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="lg" variant={variant} onClick={() => setOpen(true)}>
        <UserPlusIcon />
        مشتری جدید
      </Button>
      <CustomerFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function CustomerRowActions({
  customer,
  invoiceCount,
}: {
  customer: EditableCustomer;
  invoiceCount: number;
}) {
  const scope = useSellerScope();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(customer.phone);
      toast.success("شماره موبایل کپی شد.");
    } catch {
      toast.error("کپی انجام نشد.");
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`عملیات برای ${customer.name}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <PencilIcon />
            ویرایش
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={copyPhone}>
            <CopyIcon />
            کپی شماره موبایل
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2Icon />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomerFormDialog open={editOpen} onOpenChange={setEditOpen} customer={customer} />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`حذف مشتری «${customer.name}»`}
        description="مشتری از فهرست شما حذف می‌شود. این کار برگشت‌پذیر نیست."
        blockedReason={
          invoiceCount > 0
            ? `این مشتری در ${formatNumber(invoiceCount)} فاکتور استفاده شده و برای حفظ سابقه فاکتورها قابل حذف نیست.`
            : undefined
        }
        onConfirm={() => deleteCustomer(scope.sellerId, customer.id)}
      />
    </>
  );
}
