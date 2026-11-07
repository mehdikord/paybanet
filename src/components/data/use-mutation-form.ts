"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm, type DefaultValues, type FieldPath, type FieldValues } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import type { MutationResult } from "@/lib/mutation";

/**
 * react-hook-form + zod on the client, then a server action that re-validates.
 * Server field errors are mapped back onto the form; success shows a toast.
 */
export function useMutationForm<
  TInput extends FieldValues,
  TOutput,
  TResult extends MutationResult<string> = MutationResult<string>,
>({
  schema,
  defaultValues,
  submit,
  onSuccess,
}: {
  schema: z.ZodType<TOutput, TInput>;
  defaultValues: DefaultValues<TInput>;
  submit: (values: TInput) => Promise<TResult>;
  /** Called with the server result; return false to skip the success toast. */
  onSuccess?: (result: TResult) => void | false;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const form = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema as never),
    defaultValues,
    mode: "onTouched",
  });

  // Send the raw (untransformed) values; the server action parses them again.
  const onSubmit = form.handleSubmit(() => {
    const values = form.getValues();
    setError(undefined);
    startTransition(async () => {
      const result = await submit(values);
      if (result.ok) {
        if (onSuccess?.(result) !== false) toast.success(result.message);
        return;
      }
      for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
        if (messages?.[0]) {
          form.setError(field as FieldPath<TInput>, { message: messages[0] }, { shouldFocus: true });
        }
      }
      setError(result.message ?? (result.fieldErrors ? undefined : "ذخیره انجام نشد. دوباره تلاش کنید."));
    });
  });

  const reset = (values?: DefaultValues<TInput>) => {
    setError(undefined);
    form.reset(values ?? defaultValues);
  };

  return { form, onSubmit, isPending, error, reset };
}
