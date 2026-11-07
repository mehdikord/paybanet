import type { Metadata } from "next";

import { loginAdmin } from "@/app/admins/actions";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "ورود مدیران",
};

export default function AdminLoginPage() {
  return (
    <AuthPage
      role="admin"
      action={loginAdmin}
      title="ورود مدیران"
      description="با شماره موبایل و رمز عبور حساب مدیریت وارد شوید."
      footnote="رمز عبور را فراموش کرده‌اید؟ با مدیر ارشد سامانه تماس بگیرید."
      brandHeadline="فاکتور بفرستید، پرداخت را همان‌جا بگیرید."
      brandText="از این پنل فروشندگان، مشتریان و فاکتورهای سامانه را مدیریت می‌کنید."
    />
  );
}
