"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircleAlertIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition, type BaseSyntheticEvent } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toLatinDigits } from "@/lib/phone";
import {
  createSellerSchema,
  updateSellerSchema,
  type SellerActionState,
  type SellerFormInput,
  type SellerFormOutput,
} from "@/lib/validations/seller";

type SellerAction = (
  prev: SellerActionState,
  formData: FormData,
) => Promise<SellerActionState & { id?: string }>;

type SellerFormProps =
  | { mode: "create"; action: SellerAction; defaultValues?: undefined }
  | { mode: "edit"; action: SellerAction; defaultValues: SellerFormInput };

const emptyValues: SellerFormInput = {
  name: "",
  phone: "",
  password: "",
  passwordConfirmation: "",
  nationalCode: "",
  economicCode: "",
};

/** 12 characters without look-alikes (0/O, 1/l/I). */
function generatePassword(length = 12) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%";
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (n) => alphabet[n % alphabet.length]).join("");
}

const digitsOnChange = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.value = toLatinDigits(event.target.value);
  },
};

export function SellerForm({ mode, action, defaultValues }: SellerFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [state, formAction, isActionPending] = useActionState(action, { ok: false });
  const [isTransitionPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const pending = isActionPending || isTransitionPending;

  const form = useForm<SellerFormInput, unknown, SellerFormOutput>({
    resolver: zodResolver(isEdit ? updateSellerSchema : createSellerSchema),
    defaultValues: defaultValues ?? emptyValues,
    mode: "onTouched",
  });
  const { errors } = form.formState;

  // Apply the server's response: field errors into the form, success → toast.
  useEffect(() => {
    if (state.fieldErrors) {
      for (const [field, messages] of Object.entries(state.fieldErrors)) {
        if (messages?.[0]) {
          form.setError(field as FieldPath<SellerFormInput>, { message: messages[0] }, { shouldFocus: true });
        }
      }
    }
    if (!state.ok) return;

    toast.success(state.message);
    if (isEdit) {
      form.reset({ ...form.getValues(), password: "", passwordConfirmation: "" });
    } else {
      router.push("/admins/sellers");
    }
  }, [state, form, isEdit, router]);

  const onValid = (_values: SellerFormOutput, event?: BaseSyntheticEvent) => {
    const formElement = event?.target as HTMLFormElement | undefined;
    if (!formElement) return;
    const data = new FormData(formElement);
    startTransition(() => formAction(data));
  };

  const fillGeneratedPassword = async () => {
    const password = generatePassword();
    form.setValue("password", password, { shouldDirty: true, shouldValidate: true });
    form.setValue("passwordConfirmation", password, { shouldDirty: true, shouldValidate: true });
    setShowPassword(true);
    try {
      await navigator.clipboard.writeText(password);
      toast.success("رمز عبور ساخته و در کلیپ‌بورد کپی شد.");
    } catch {
      toast.info("رمز عبور ساخته شد. آن را یادداشت کنید.");
    }
  };

  const serverMessage = !state.ok && !pending ? state.message : undefined;

  return (
    <form noValidate onSubmit={form.handleSubmit(onValid)} className="rounded-2xl border bg-card">
      <div className="space-y-8 p-5 sm:p-8">
        {serverMessage && (
          <Alert variant="destructive" aria-live="assertive">
            <CircleAlertIcon />
            <AlertDescription>{serverMessage}</AlertDescription>
          </Alert>
        )}

        <FieldSet>
          <FieldLegend>اطلاعات فروشنده</FieldLegend>
          <FieldDescription>نام و شماره موبایل برای ورود فروشنده به پنلش استفاده می‌شود.</FieldDescription>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">نام فروشنده یا فروشگاه</FieldLabel>
              <Input
                id="name"
                autoComplete="off"
                aria-invalid={!!errors.name}
                className="h-10"
                {...form.register("name")}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">شماره موبایل</FieldLabel>
              <Input
                id="phone"
                type="tel"
                dir="ltr"
                inputMode="numeric"
                autoComplete="off"
                maxLength={14}
                placeholder="09xx xxx xxxx"
                aria-invalid={!!errors.phone}
                className="h-10 text-left"
                {...form.register("phone", digitsOnChange)}
              />
              <FieldError>{errors.phone?.message}</FieldError>
            </Field>
          </FieldGroup>
        </FieldSet>

        <Separator />

        <FieldSet>
          <FieldLegend>اطلاعات مالیاتی</FieldLegend>
          <FieldDescription>اختیاری است و روی فاکتورهای فروشنده چاپ می‌شود.</FieldDescription>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field data-invalid={!!errors.nationalCode}>
              <FieldLabel htmlFor="nationalCode">کد ملی</FieldLabel>
              <Input
                id="nationalCode"
                dir="ltr"
                inputMode="numeric"
                autoComplete="off"
                maxLength={10}
                aria-invalid={!!errors.nationalCode}
                className="h-10 text-left"
                {...form.register("nationalCode", digitsOnChange)}
              />
              <FieldError>{errors.nationalCode?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.economicCode}>
              <FieldLabel htmlFor="economicCode">کد اقتصادی</FieldLabel>
              <Input
                id="economicCode"
                dir="ltr"
                inputMode="numeric"
                autoComplete="off"
                maxLength={12}
                aria-invalid={!!errors.economicCode}
                className="h-10 text-left"
                {...form.register("economicCode", digitsOnChange)}
              />
              <FieldError>{errors.economicCode?.message}</FieldError>
            </Field>
          </FieldGroup>
        </FieldSet>

        <Separator />

        <FieldSet>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <FieldLegend>{isEdit ? "تغییر رمز عبور" : "رمز عبور"}</FieldLegend>
              <FieldDescription>
                {isEdit
                  ? "برای حفظ رمز فعلی، این دو فیلد را خالی بگذارید."
                  : "حداقل ۸ کاراکتر. رمز را به فروشنده اطلاع دهید."}
              </FieldDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={fillGeneratedPassword}>
              <KeyRoundIcon />
              ساخت رمز تصادفی
            </Button>
          </div>
          <FieldGroup className="grid gap-5 md:grid-cols-2">
            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">{isEdit ? "رمز عبور جدید" : "رمز عبور"}</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className="text-left"
                  {...form.register("password", {
                    deps: ["passwordConfirmation"],
                  })}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <FieldError>{errors.password?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.passwordConfirmation}>
              <FieldLabel htmlFor="passwordConfirmation">تکرار رمز عبور</FieldLabel>
              <Input
                id="passwordConfirmation"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                autoComplete="new-password"
                aria-invalid={!!errors.passwordConfirmation}
                className="h-10 text-left"
                {...form.register("passwordConfirmation", {
                  // A mismatch error shown early (via `deps`) must clear as soon as
                  // the value matches, not on blur — otherwise the layout jumps
                  // under the submit button while it is being clicked.
                  onChange: () => {
                    if (form.formState.errors.passwordConfirmation) form.trigger("passwordConfirmation");
                  },
                })}
              />
              <FieldError>{errors.passwordConfirmation?.message}</FieldError>
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>

      <div className="flex flex-col-reverse gap-2 rounded-b-2xl border-t bg-muted/40 px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
        <Button asChild variant="ghost" size="lg">
          <Link href="/admins/sellers">{isEdit ? "بازگشت به فهرست" : "انصراف"}</Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending || (isEdit && !form.formState.isDirty)}>
          {pending && <Spinner />}
          {isEdit ? "ذخیره تغییرات" : "ساخت فروشنده"}
        </Button>
      </div>
    </form>
  );
}
