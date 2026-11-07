"use server";

import { redirect } from "next/navigation";

import { safePanelRedirect } from "@/lib/auth/cookies";
import { attemptLogin } from "@/lib/auth/login";
import { destroySellerSession, SELLER_LOGIN_PATH } from "@/lib/auth/seller";
import type { LoginState } from "@/lib/validations/auth";

export async function loginSeller(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const result = await attemptLogin("seller", formData);
  if (!result.ok) return result;
  redirect(safePanelRedirect("seller", formData.get("callbackUrl")));
}

export async function logoutSeller() {
  await destroySellerSession();
  redirect(SELLER_LOGIN_PATH);
}
