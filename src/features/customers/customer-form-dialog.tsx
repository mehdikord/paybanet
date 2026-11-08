"use client";

import { FormDialog, FormDialogForm } from "@/components/data/form-dialog";
import { useMutationForm } from "@/components/data/use-mutation-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toLatinDigits } from "@/lib/phone";
import { customerSchema, type CustomerInput } from "@/lib/validations/customer";
import { useSellerScope } from "@/features/seller-scope";
import { saveCustomer } from "./actions";

export type EditableCustomer = CustomerInput & { id: string };

const emptyCustomer: CustomerInput = { name: "", phone: "", economicCode: "", description: "" };

const latinDigits = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.value = toLatinDigits(event.target.value);
  },
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create a new customer. */
  customer?: EditableCustomer;
};

export function CustomerFormDialog({ open, onOpenChange, customer }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <CustomerForm customer={customer} onDone={() => onOpenChange(false)} />
    </FormDialog>
  );
}

function CustomerForm({ customer, onDone }: { customer?: EditableCustomer; onDone: () => void }) {
  const isEdit = !!customer;
  const scope = useSellerScope();
  const { form, onSubmit, isPending, error } = useMutationForm({
    schema: customerSchema,
    defaultValues: customer
      ? {
          name: customer.name,
          phone: customer.phone,
          economicCode: customer.economicCode ?? "",
          description: customer.description ?? "",
        }
      : emptyCustomer,
    submit: (values) => saveCustomer(scope.sellerId, customer?.id ?? null, values),
    onSuccess: onDone,
  });
  const { errors } = form.formState;
  const descriptionLength = form.watch("description")?.length ?? 0;

  return (
    <FormDialogForm
      title={isEdit ? "ویرایش مشتری" : "مشتری جدید"}
      description={isEdit ? undefined : "مشتری را یک بار ثبت کنید و در فاکتورهای بعدی از فهرست انتخابش کنید."}
      submitLabel={isEdit ? "ذخیره تغییرات" : "افزودن مشتری"}
      pending={isPending}
      error={error}
      onSubmit={onSubmit}
    >
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor="customer-name">نام مشتری</FieldLabel>
        <Input
          id="customer-name"
          autoComplete="off"
          autoFocus
          aria-invalid={!!errors.name}
          className="h-10"
          {...form.register("name")}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.phone}>
        <FieldLabel htmlFor="customer-phone">شماره موبایل</FieldLabel>
        <Input
          id="customer-phone"
          type="tel"
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
          placeholder="09xx xxx xxxx"
          aria-invalid={!!errors.phone}
          className="h-10 text-left"
          {...form.register("phone", latinDigits)}
        />
        <FieldError>{errors.phone?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.economicCode}>
        <FieldLabel htmlFor="customer-economic">
          کد اقتصادی <span className="font-normal text-muted-foreground">(اختیاری)</span>
        </FieldLabel>
        <Input
          id="customer-economic"
          dir="ltr"
          inputMode="numeric"
          autoComplete="off"
          maxLength={12}
          aria-invalid={!!errors.economicCode}
          className="h-10 text-left"
          {...form.register("economicCode", latinDigits)}
        />
        <FieldError>{errors.economicCode?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.description}>
        <div className="flex items-baseline justify-between">
          <FieldLabel htmlFor="customer-description">
            توضیحات <span className="font-normal text-muted-foreground">(اختیاری)</span>
          </FieldLabel>
          <span
            className={`text-xs tabular-nums ${descriptionLength > 255 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {descriptionLength.toLocaleString("fa-IR")} / ۲۵۵
          </span>
        </div>
        <Textarea
          id="customer-description"
          rows={3}
          aria-invalid={!!errors.description}
          placeholder="مثلاً آدرس یا یادداشتی درباره مشتری"
          {...form.register("description")}
        />
        <FieldError>{errors.description?.message}</FieldError>
      </Field>
    </FormDialogForm>
  );
}
