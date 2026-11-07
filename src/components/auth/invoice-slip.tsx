/**
 * Decorative sample invoice for the login brand panel.
 * Shows what the product does: an invoice with a payment link, marked paid.
 */
const items = [
  { name: "کابل شارژ تایپ‌سی", qty: "۲", price: "۴۸۰٬۰۰۰" },
  { name: "پاوربانک ۱۰ هزار", qty: "۱", price: "۱٬۲۵۰٬۰۰۰" },
  { name: "هزینه ارسال", qty: "۱", price: "۹۰٬۰۰۰" },
];

export function InvoiceSlip() {
  return (
    <div aria-hidden="true" className="animate-slip-in relative w-full max-w-[340px] select-none">
      <div className="slip-edge rounded-t-2xl bg-white px-7 pt-7 pb-10 text-[#10282b] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.55)]">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold">فاکتور فروش</span>
          <span className="text-sm text-[#536966]">شماره ۱۰۲۸۷</span>
        </div>
        <p className="mt-1 text-sm text-[#536966]">مشتری: سارا محمدی</p>

        <div className="mt-6 border-t border-dashed border-[#cfdbd8]" />

        <ul className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.name} className="flex items-center justify-between gap-3">
              <span className="truncate">
                {item.name}
                <span className="text-[#536966]"> × {item.qty}</span>
              </span>
              <span className="tabular-nums">{item.price}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 border-t border-dashed border-[#cfdbd8]" />

        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-sm text-[#536966]">جمع کل</span>
          <span className="text-xl font-extrabold tabular-nums">
            ۱٬۸۲۰٬۰۰۰ <span className="text-sm font-medium">تومان</span>
          </span>
        </div>

        <div className="mt-6 rounded-lg bg-[#e3f1ee] px-3 py-2.5">
          <p className="text-xs text-[#0b4f48]">لینک پرداخت</p>
          <p dir="ltr" className="mt-0.5 text-left font-mono text-sm font-semibold text-[#0b7a6e]">
            paybanet.ir/pay/7Kq2xM
          </p>
        </div>
      </div>

      <div className="animate-stamp-in absolute -left-8 -top-5 rounded-xl border-[3px] border-saffron bg-ink/85 px-4 py-1.5 text-xl font-black text-saffron backdrop-blur-sm">
        پرداخت شد
      </div>
    </div>
  );
}
