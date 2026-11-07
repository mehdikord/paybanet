"use server";

import { redirect } from "next/navigation";

import { ADMIN_LOGIN_PATH, destroyAdminSession } from "@/lib/auth/admin";
import { safePanelRedirect } from "@/lib/auth/cookies";
import { attemptLogin } from "@/lib/auth/login";
import type { LoginState } from "@/lib/validations/auth";

export async function loginAdmin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const result = await attemptLogin("admin", formData);
  if (!result.ok) return result;
  redirect(safePanelRedirect("admin", formData.get("callbackUrl")));
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect(ADMIN_LOGIN_PATH);
}
