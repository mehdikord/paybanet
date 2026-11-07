"use client";

import { CopyIcon, EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteSellerDialog, type DeletableSeller } from "./delete-seller-dialog";

export function SellerRowActions({ seller, phone }: { seller: DeletableSeller; phone: string }) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const copyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      toast.success("شماره موبایل کپی شد.");
    } catch {
      toast.error("کپی انجام نشد.");
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`عملیات برای ${seller.name}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href={`/admins/sellers/${seller.id}`}>
              <PencilIcon />
              ویرایش
            </Link>
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

      <DeleteSellerDialog seller={seller} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}
