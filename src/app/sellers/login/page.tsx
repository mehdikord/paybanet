import type { Metadata } from "next";

import { loginSeller } from "@/app/sellers/actions";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "ورود فروشندگان",
};

export default function SellerLoginPage() {
  return (
    <AuthPage
      role="seller"
      action={loginSeller}
      title="ورود فروشندگان"
      description="با شماره موبایل و رمز عبوری که پی با نت برایتان ساخته وارد شوید."
      footnote="رمز عبور را فراموش کرده‌اید؟ با پشتیبانی پی با نت تماس بگیرید."
      brandHeadline="فاکتور بفرستید، پرداخت را همان‌جا بگیرید."
      brandText="مشتریان و محصولاتتان را یک‌جا نگه دارید و برای هر خرید، لینک پرداخت بفرستید."
    />
  );
}
