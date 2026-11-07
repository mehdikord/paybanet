"use client";

import { LockIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";
import { useTransition } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import type { MutationResult } from "@/lib/mutation";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** When set, deleting is not allowed and this explains why. */
  blockedReason?: string;
  onConfirm: () => Promise<MutationResult>;
};

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  blockedReason,
  onConfirm,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () =>
    startTransition(async () => {
      const result = await onConfirm();
      if (result.ok) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message ?? "حذف انجام نشد.");
      }
    });

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia
            className={blockedReason ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"}
          >
            {blockedReason ? <LockIcon /> : <TriangleAlertIcon />}
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{blockedReason ?? description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{blockedReason ? "متوجه شدم" : "انصراف"}</AlertDialogCancel>
          {!blockedReason && (
            <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
              {isPending ? <Spinner /> : <Trash2Icon />}
              حذف
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
