import { Suspense } from "react";

import { Logo } from "@/components/brand/logo";
import type { SessionRole } from "@/lib/auth/session";
import { InvoiceSlip } from "./invoice-slip";
import { LoginForm, type LoginAction } from "./login-form";
import { RedirectIfAuthenticated } from "./redirect-if-authenticated";

type AuthPageProps = {
  role: SessionRole;
  action: LoginAction;
  title: string;
  description: string;
  /** Short line under the form, e.g. who to contact about a forgotten password. */
  footnote: string;
  brandHeadline: string;
  brandText: string;
};

/** Split login layout shared by every panel: form on the right, brand panel on the left. */
export function AuthPage({
  role,
  action,
  title,
  description,
  footnote,
  brandHeadline,
  brandText,
}: AuthPageProps) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Suspense fallback={null}>
        <RedirectIfAuthenticated role={role} />
      </Suspense>

      <section className="flex flex-col px-4 py-8 sm:px-10">
        <Logo />

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 mb-8 text-muted-foreground">{description}</p>
          <LoginForm action={action} />
        </div>

        <p className="text-center text-sm text-muted-foreground">{footnote}</p>
      </section>

      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-14 lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#2ec4b0_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <InvoiceSlip />
        <div className="relative max-w-sm text-center">
          <p className="text-2xl leading-relaxed font-bold">{brandHeadline}</p>
          <p className="mt-3 leading-7 text-[#a9c2bd]">{brandText}</p>
        </div>
      </aside>
    </main>
  );
}
