"use client";

import { WandSparklesIcon } from "lucide-react";

import { FormDialog, FormDialogForm } from "@/components/data/form-dialog";
import { useMutationForm } from "@/components/data/use-mutation-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { digitsOnly, formatAmountInput, formatToman } from "@/lib/money";
import { productSchema, type ProductInput } from "@/lib/validations/product";
import { useSellerScope } from "@/features/seller-scope";
import { saveProduct } from "./actions";

export type EditableProduct = ProductInput & { id: string };

const emptyProduct: ProductInput = { name: "", code: "", price: "", description: "" };

/** e.g. P-7KQ2XM (no look-alike characters). */
function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(6));
  return "P-" + Array.from(bytes, (n) => alphabet[n % alphabet.length]).join("");
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit to create a new product. */
  product?: EditableProduct;
};

export function ProductFormDialog({ open, onOpenChange, product }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange}>
      <ProductForm product={product} onDone={() => onOpenChange(false)} />
    </FormDialog>
  );
}

function ProductForm({ product, onDone }: { product?: EditableProduct; onDone: () => void }) {
  const isEdit = !!product;
  const scope = useSellerScope();
  const { form, onSubmit, isPending, error } = useMutationForm({
    schema: productSchema,
    defaultValues: product
      ? {
          name: product.name,
          code: product.code,
          price: formatAmountInput(product.price),
          description: product.description ?? "",
        }
      : emptyProduct,
    submit: (values) => saveProduct(scope.sellerId, product?.id ?? null, values),
    onSuccess: onDone,
  });
  const { errors } = form.formState;
  const priceDigits = digitsOnly(form.watch("price") ?? "");
  const descriptionLength = form.watch("description")?.length ?? 0;

  return (
    <FormDialogForm
      title={isEdit ? "ویرایش محصول" : "محصول جدید"}
      description={
        isEdit
          ? "تغییر قیمت فقط روی فاکتورهای بعدی اثر دارد."
          : "محصول را یک بار ثبت کنید و در فاکتورها از فهرست انتخابش کنید."
      }
      submitLabel={isEdit ? "ذخیره تغییرات" : "افزودن محصول"}
      pending={isPending}
      error={error}
      onSubmit={onSubmit}
    >
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor="product-name">نام محصول</FieldLabel>
        <Input
          id="product-name"
          autoComplete="off"
          autoFocus
          aria-invalid={!!errors.name}
          className="h-10"
          {...form.register("name")}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.code}>
          <FieldLabel htmlFor="product-code">کد محصول</FieldLabel>
          <InputGroup className="h-10">
            <InputGroupInput
              id="product-code"
              dir="ltr"
              autoComplete="off"
              maxLength={64}
              placeholder="P-1001"
              aria-invalid={!!errors.code}
              className="text-left"
              {...form.register("code")}
            />
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <InputGroupButton
                    size="icon-xs"
                    aria-label="ساخت کد خودکار"
                    onClick={() =>
                      form.setValue("code", generateCode(), { shouldDirty: true, shouldValidate: true })
                    }
                  >
                    <WandSparklesIcon />
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>ساخت کد خودکار</TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
          <FieldError>{errors.code?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.price}>
          <FieldLabel htmlFor="product-price">قیمت</FieldLabel>
          <InputGroup className="h-10">
            <InputGroupInput
              id="product-price"
              dir="ltr"
              inputMode="numeric"
              autoComplete="off"
              maxLength={17}
              placeholder="0"
              aria-invalid={!!errors.price}
              aria-describedby="product-price-hint"
              className="text-left tabular-nums"
              {...form.register("price", {
                onChange: (event) => {
                  event.target.value = formatAmountInput(event.target.value);
                },
              })}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>تومان</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          {priceDigits && !errors.price ? (
            <FieldDescription id="product-price-hint">{formatToman(priceDigits)} تومان</FieldDescription>
          ) : null}
          <FieldError>{errors.price?.message}</FieldError>
        </Field>
      </div>

      <Field data-invalid={!!errors.description}>
        <div className="flex items-baseline justify-between">
          <FieldLabel htmlFor="product-description">
            توضیحات <span className="font-normal text-muted-foreground">(اختیاری)</span>
          </FieldLabel>
          <span
            className={`text-xs tabular-nums ${descriptionLength > 255 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {descriptionLength.toLocaleString("fa-IR")} / ۲۵۵
          </span>
        </div>
        <Textarea
          id="product-description"
          rows={3}
          aria-invalid={!!errors.description}
          placeholder="مثلاً رنگ، اندازه یا گارانتی"
          {...form.register("description")}
        />
        <FieldError>{errors.description?.message}</FieldError>
      </Field>
    </FormDialogForm>
  );
}
