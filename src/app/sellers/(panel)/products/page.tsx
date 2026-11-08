import type { Metadata } from "next";

import { ProductsView } from "@/features/products/products-view";
import { SELF_SCOPE } from "@/features/seller-scope-paths";

export const metadata: Metadata = {
  title: "محصولات",
};

export default function ProductsPage(props: PageProps<"/sellers/products">) {
  return (
    <ProductsView
      scope={SELF_SCOPE}
      title="محصولات"
      description="کالاها و خدماتی که در فاکتورهایتان می‌فروشید. قیمت‌ها به تومان است."
      searchParams={props.searchParams}
    />
  );
}
