"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, EyeIcon, EyeOffIcon, LockKeyholeIcon, SmartphoneIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState, useState, useTransition, type BaseSyntheticEvent } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toLatinDigits } from "@/lib/phone";
import {
  loginSchema,
  type LoginInput,
  type LoginOutput,
  type LoginState,
} from "@/lib/validations/auth";

const initialState: LoginState = { ok: false };

function CallbackUrlField() {
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "";
  return <input type="hidden" name="callbackUrl" value={callbackUrl} />;
}

export type LoginAction = (prev: LoginState, formData: FormData) => Promise<LoginState>;

export function LoginForm({ action }: { action: LoginAction }) {
  const [state, formAction, isActionPending] = useActionState(action, initialState);
  const [isTransitionPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const pending = isActionPending || isTransitionPending;

  const form = useForm<LoginInput, unknown, LoginOutput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "", remember: true },
    mode: "onTouched",
  });

  // Client-side validation passed: submit the real form fields to the server action.
  const onValid = (_values: LoginOutput, event?: BaseSyntheticEvent) => {
    const formElement = event?.target as HTMLFormElement | undefined;
    if (!formElement) return;
    const data = new FormData(formElement);
    startTransition(() => formAction(data));
  };

  const phoneError = form.formState.errors.phone?.message ?? state.fieldErrors?.phone?.[0];
  const passwordError =
    form.formState.errors.password?.message ?? state.fieldErrors?.password?.[0];

  return (
    <form noValidate onSubmit={form.handleSubmit(onValid)} className="w-full">
      <Suspense fallback={null}>
        <CallbackUrlField />
      </Suspense>

      <FieldGroup className="gap-5">
        {state.message && !pending && (
          <Alert variant="destructive" aria-live="assertive">
            <CircleAlertIcon />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <Field data-invalid={!!phoneError}>
          <FieldLabel htmlFor="phone">شماره موبایل</FieldLabel>
          <InputGroup className="h-11">
            <InputGroupInput
              id="phone"
              type="tel"
              dir="ltr"
              inputMode="numeric"
              autoComplete="username"
              autoFocus
              maxLength={14}
              placeholder="09xx xxx xxxx"
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? "phone-error" : undefined}
              className="text-left text-base tracking-wider placeholder:tracking-wider"
              {...form.register("phone", {
                onChange: (event) => {
                  event.target.value = toLatinDigits(event.target.value);
                },
              })}
            />
            <InputGroupAddon>
              <SmartphoneIcon />
            </InputGroupAddon>
          </InputGroup>
          <FieldError id="phone-error">{phoneError}</FieldError>
        </Field>

        <Field data-invalid={!!passwordError}>
          <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
          <InputGroup className="h-11">
            <InputGroupInput
              id="password"
              type={showPassword ? "text" : "password"}
              dir="ltr"
              autoComplete="current-password"
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "password-error" : undefined}
              className="text-left text-base"
              onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
              {...form.register("password")}
            />
            <InputGroupAddon>
              <LockKeyholeIcon />
            </InputGroupAddon>
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
          {capsLock && !passwordError && (
            <p className="text-sm text-amber-700 dark:text-amber-400">Caps Lock روشن است.</p>
          )}
          <FieldError id="password-error">{passwordError}</FieldError>
        </Field>

        <Controller
          control={form.control}
          name="remember"
          render={({ field }) => (
            <Field orientation="horizontal" className="gap-2.5">
              <Checkbox
                id="remember"
                name="remember"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldLabel htmlFor="remember" className="font-normal">
                مرا به خاطر بسپار
                <span className="text-muted-foreground">(۳۰ روز)</span>
              </FieldLabel>
            </Field>
          )}
        />

        <Button type="submit" size="lg" className="h-11 w-full text-base" disabled={pending}>
          {pending ? (
            <>
              <Spinner />
              در حال ورود…
            </>
          ) : (
            "ورود به پنل"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
