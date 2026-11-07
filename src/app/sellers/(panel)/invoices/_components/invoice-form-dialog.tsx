"use client";

import { CheckCircle2Icon, CopyIcon, ExternalLinkIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AsyncCombobox } from "@/components/data/async-combobox";
import { DatePicker } from "@/components/data/date-picker";
import { FormDialog, FormDialogForm } from "@/components/data/form-dialog";
import { useMutationForm } from "@/components/data/use-mutation-form";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { todayIsoDay } from "@/lib/dates";
import { formatAmountInput, formatToman } from "@/lib/money";
import { payLinkPath } from "@/lib/pay-link";
import { toLatinDigits } from "@/lib/phone";
import {
  invoiceSchema,
  lineTotalToman,
  type InvoiceInput,
  type InvoiceItemInput,
} from "@/lib/validations/invoice";
import {
  loadInvoiceForEdit,
  saveInvoice,
  searchCustomerOptions,
  searchProductOptions,
  type PickerOption,
} from "../actions";

const emptyItem: InvoiceItemInput = { productId: "", productName: "", quantity: "1", price: "" };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create a new invoice. */
  invoiceId?: string;
};

export function InvoiceFormDialog({ open, onOpenChange, invoiceId }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} className="sm:max-w-3xl">
      {invoiceId ? (
        <EditInvoiceLoader invoiceId={invoiceId} onDone={() => onOpenChange(false)} />
      ) : (
        <InvoiceForm onDone={() => onOpenChange(false)} />
      )}
    </FormDialog>
  );
}

/** Loads the invoice, then renders the form with its values. */
function EditInvoiceLoader({ invoiceId, onDone }: { invoiceId: string; onDone: () => void }) {
  const [values, setValues] = useState<InvoiceInput | null | undefined>();

  useEffect(() => {
    let cancelled = false;
    loadInvoiceForEdit(invoiceId).then((invoice) => {
      if (cancelled) return;
      setValues(
        invoice && {
          customerId: invoice.customerId,
          customerName: invoice.customerName,
          invoiceDate: invoice.invoiceDate,
          items: invoice.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: String(item.quantity),
            price: formatAmountInput(item.price),
          })),
        },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  if (values === undefined) {
    return (
      <div className="space-y-4 p-5" aria-busy="true">
        <DialogTitle className="text-base font-bold">ویرایش فاکتور</DialogTitle>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  if (values === null) {
    return (
      <div className="space-y-2 p-5">
        <DialogTitle className="text-base font-bold">فاکتور پیدا نشد</DialogTitle>
        <DialogDescription>این فاکتور حذف شده است.</DialogDescription>
      </div>
    );
  }
  return <InvoiceForm invoiceId={invoiceId} initial={values} onDone={onDone} />;
}

function InvoiceForm({
  invoiceId,
  initial,
  onDone,
}: {
  invoiceId?: string;
  initial?: InvoiceInput;
  onDone: () => void;
}) {
  const isEdit = !!invoiceId;
  const [created, setCreated] = useState<{ payLink: string; message?: string } | null>(null);

  const { form, onSubmit, isPending, error } = useMutationForm({
    schema: invoiceSchema,
    defaultValues: initial ?? {
      customerId: "",
      customerName: "",
      invoiceDate: todayIsoDay(),
      items: [emptyItem],
    },
    submit: (values) => saveInvoice(invoiceId ?? null, values),
    onSuccess: (result) => {
      if (!isEdit && result.payLink) {
        setCreated({ payLink: result.payLink, message: result.message });
        return false; // the success panel replaces the toast
      }
      onDone();
    },
  });
  const { errors } = form.formState;
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const items = useWatch({ control: form.control, name: "items" });
  const total = (items ?? []).reduce((sum, item) => sum + lineTotalToman(item), BigInt(0));

  if (created) return <CreatedPanel payLink={created.payLink} message={created.message} />;

  const itemsError = errors.items?.root?.message ?? errors.items?.message;

  return (
    <FormDialogForm
      title={isEdit ? `ویرایش فاکتور شماره ${Number(invoiceId).toLocaleString("fa-IR", { useGrouping: false })}` : "فاکتور جدید"}
      description={isEdit ? "مبلغ کل پس از ذخیره دوباره محاسبه می‌شود." : "پس از صدور، لینک پرداخت فاکتور ساخته می‌شود."}
      submitLabel={isEdit ? "ذخیره تغییرات" : "صدور فاکتور"}
      pending={isPending}
      error={error}
      onSubmit={onSubmit}
    >
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_220px]">
        <Field data-invalid={!!errors.customerId}>
          <FieldLabel htmlFor="invoice-customer">مشتری</FieldLabel>
          <Controller
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <AsyncCombobox<PickerOption>
                id="invoice-customer"
                value={field.value ? { id: field.value, label: form.getValues("customerName") ?? "" } : null}
                onSelect={(option) => {
                  form.setValue("customerName", option.label);
                  field.onChange(option.id);
                }}
                search={searchCustomerOptions}
                placeholder="انتخاب مشتری"
                searchPlaceholder="جستجوی نام یا موبایل…"
                emptyText="مشتری‌ای پیدا نشد. اول از بخش مشتریان اضافه‌اش کنید."
                invalid={!!errors.customerId}
              />
            )}
          />
          <FieldError>{errors.customerId?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.invoiceDate}>
          <FieldLabel htmlFor="invoice-date">تاریخ فاکتور</FieldLabel>
          <Controller
            control={form.control}
            name="invoiceDate"
            render={({ field }) => (
              <DatePicker
                id="invoice-date"
                value={field.value}
                onChange={field.onChange}
                invalid={!!errors.invoiceDate}
              />
            )}
          />
          <FieldError>{errors.invoiceDate?.message}</FieldError>
        </Field>
      </div>

      <section aria-labelledby="items-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 id="items-title" className="font-semibold">
            اقلام فاکتور
          </h3>
          <span className="text-sm text-muted-foreground">{fields.length.toLocaleString("fa-IR")} ردیف</span>
        </div>

        <div className="hidden grid-cols-[minmax(0,1fr)_88px_150px_130px_36px] gap-2 px-1 text-xs text-muted-foreground sm:grid">
          <span>محصول</span>
          <span>تعداد</span>
          <span>قیمت واحد</span>
          <span>جمع ردیف</span>
          <span />
        </div>

        <ol className="space-y-3 sm:space-y-2">
          {fields.map((field, index) => {
            const itemErrors = errors.items?.[index];
            const item = items?.[index];
            return (
              <li
                key={field.id}
                className="grid grid-cols-2 gap-2 rounded-xl border p-3 sm:grid-cols-[minmax(0,1fr)_88px_150px_130px_36px] sm:items-start sm:rounded-none sm:border-0 sm:p-0"
              >
                <div className="col-span-2 sm:col-span-1">
                  <Controller
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field: productField }) => (
                      <AsyncCombobox<PickerOption>
                        value={
                          productField.value
                            ? { id: productField.value, label: item?.productName ?? "" }
                            : null
                        }
                        onSelect={(option) => {
                          form.setValue(`items.${index}.productName`, option.label);
                          form.setValue(`items.${index}.price`, formatAmountInput(option.price ?? ""), {
                            shouldValidate: true,
                          });
                          productField.onChange(option.id);
                        }}
                        search={searchProductOptions}
                        placeholder={`انتخاب محصول ردیف ${(index + 1).toLocaleString("fa-IR")}`}
                        searchPlaceholder="جستجوی نام یا کد محصول…"
                        emptyText="محصولی پیدا نشد. اول از بخش محصولات اضافه‌اش کنید."
                        invalid={!!itemErrors?.productId}
                      />
                    )}
                  />
                  <FieldError className="mt-1 text-xs">{itemErrors?.productId?.message}</FieldError>
                </div>

                <div>
                  <span className="mb-1 block text-xs text-muted-foreground sm:hidden">تعداد</span>
                  <Input
                    dir="ltr"
                    inputMode="numeric"
                    aria-label={`تعداد ردیف ${index + 1}`}
                    aria-invalid={!!itemErrors?.quantity}
                    className="h-10 text-center tabular-nums"
                    {...form.register(`items.${index}.quantity`, {
                      onChange: (e) => {
                        e.target.value = toLatinDigits(e.target.value).replace(/[^\d]/g, "");
                      },
                    })}
                  />
                  <FieldError className="mt-1 text-xs">{itemErrors?.quantity?.message}</FieldError>
                </div>

                <div>
                  <span className="mb-1 block text-xs text-muted-foreground sm:hidden">قیمت واحد</span>
                  <InputGroup className="h-10">
                    <InputGroupInput
                      dir="ltr"
                      inputMode="numeric"
                      aria-label={`قیمت واحد ردیف ${index + 1} به تومان`}
                      aria-invalid={!!itemErrors?.price}
                      className="text-left tabular-nums"
                      {...form.register(`items.${index}.price`, {
                        onChange: (e) => {
                          e.target.value = formatAmountInput(e.target.value);
                        },
                      })}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText className="text-xs">تومان</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError className="mt-1 text-xs">{itemErrors?.price?.message}</FieldError>
                </div>

                <div className="col-span-1 flex h-10 items-center text-sm font-semibold tabular-nums sm:col-span-1">
                  <span className="me-1 text-xs font-normal text-muted-foreground sm:hidden">جمع:</span>
                  {formatToman(lineTotalToman(item ?? emptyItem))}
                </div>

                <div className="flex justify-end sm:block">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`حذف ردیف ${index + 1}`}
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>

        {itemsError && <FieldError>{itemsError}</FieldError>}

        <Button type="button" variant="outline" size="sm" onClick={() => append(emptyItem)}>
          <PlusIcon />
          افزودن ردیف
        </Button>
      </section>

      <div className="flex items-center justify-between rounded-xl bg-ink px-5 py-4 text-white">
        <span className="text-sm text-[#a9c2bd]">جمع کل فاکتور</span>
        <span className="text-2xl font-extrabold tabular-nums" aria-live="polite">
          {formatToman(total)} <span className="text-sm font-medium text-[#a9c2bd]">تومان</span>
        </span>
      </div>
    </FormDialogForm>
  );
}

/** Shown after a new invoice is issued: the payment link, ready to share. */
function CreatedPanel({ payLink, message }: { payLink: string; message?: string }) {
  const url = typeof window === "undefined" ? payLinkPath(payLink) : `${window.location.origin}${payLinkPath(payLink)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("لینک پرداخت کپی شد.");
    } catch {
      toast.error("کپی انجام نشد.");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-3 px-5 pt-8 pb-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
          <CheckCircle2Icon className="size-8" />
        </span>
        <DialogTitle className="text-lg font-bold">{message ?? "فاکتور صادر شد."}</DialogTitle>
        <DialogDescription>این لینک را برای مشتری بفرستید تا فاکتور را ببیند و پرداخت کند.</DialogDescription>
        <div className="mt-2 flex w-full max-w-md items-center gap-2 rounded-xl border bg-muted/50 p-2">
          <code dir="ltr" className="flex-1 truncate px-2 text-left text-sm">
            {url}
          </code>
          <Button size="sm" onClick={copy}>
            <CopyIcon />
            کپی
          </Button>
        </div>
      </div>
      <DialogFooter className="mx-0 mb-0 px-5 py-4">
        <DialogClose asChild>
          <Button variant="ghost">بستن</Button>
        </DialogClose>
        <Button variant="outline" asChild>
          <a href={payLinkPath(payLink)} target="_blank" rel="noreferrer">
            <ExternalLinkIcon />
            مشاهده صفحه پرداخت
          </a>
        </Button>
      </DialogFooter>
    </div>
  );
}

