"use client";

import { CopyIcon, EllipsisVerticalIcon, PackagePlusIcon, PencilIcon, Trash2Icon } from "lucide-react";
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
import { deleteProduct } from "./actions";
import { ProductFormDialog, type EditableProduct } from "./product-form-dialog";

export function NewProductButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        <PackagePlusIcon />
        محصول جدید
      </Button>
      <ProductFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export function ProductRowActions({
  product,
  orderCount,
}: {
  product: EditableProduct;
  orderCount: number;
}) {
  const scope = useSellerScope();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(product.code);
      toast.success("کد محصول کپی شد.");
    } catch {
      toast.error("کپی انجام نشد.");
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`عملیات برای ${product.name}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <PencilIcon />
            ویرایش
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={copyCode}>
            <CopyIcon />
            کپی کد محصول
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2Icon />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductFormDialog open={editOpen} onOpenChange={setEditOpen} product={product} />
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`حذف محصول «${product.name}»`}
        description="محصول از فهرست شما حذف می‌شود. این کار برگشت‌پذیر نیست."
        blockedReason={
          orderCount > 0
            ? `این محصول در ${formatNumber(orderCount)} ردیف فاکتور استفاده شده و برای حفظ سابقه فاکتورها قابل حذف نیست.`
            : undefined
        }
        onConfirm={() => deleteProduct(scope.sellerId, product.id)}
      />
    </>
  );
}
