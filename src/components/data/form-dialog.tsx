"use client";

import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Modal for create/edit forms. Its children are mounted only while open,
 * so a form inside starts fresh (default values) every time it opens.
 */
export function FormDialog({
  open,
  onOpenChange,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("flex max-h-[calc(100svh-2rem)] flex-col gap-0 p-0 sm:max-w-lg", className)}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

/** Header, scrollable fields and sticky actions of a dialog form. */
export function FormDialogForm({
  title,
  description,
  submitLabel,
  pending,
  error,
  onSubmit,
  children,
}: {
  title: string;
  description?: string;
  submitLabel: string;
  pending: boolean;
  /** Server-side message that isn't tied to a field. */
  error?: string;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
}) {
  return (
    <form noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <DialogHeader className="border-b px-5 pt-5 pb-4 text-start">
        <DialogTitle className="text-base font-bold">{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>

      <fieldset disabled={pending} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {error && !pending && (
          <Alert variant="destructive" aria-live="assertive">
            <CircleAlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {children}
      </fieldset>

      <DialogFooter className="mx-0 mb-0 px-5 py-4">
        <DialogClose asChild>
          <Button type="button" variant="ghost" disabled={pending}>
            انصراف
          </Button>
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
