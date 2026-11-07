"use client";

import { AmountRangeFilter } from "@/components/data/amount-range-filter";
import { FilterSelect } from "@/components/data/filter-select";
import { ResetFiltersButton } from "@/components/data/reset-filters-button";
import { SearchInput } from "@/components/data/search-input";

export function ProductsToolbar() {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
      <SearchInput placeholder="جستجوی نام، کد یا توضیحات" label="جستجوی محصولات" />
      <AmountRangeFilter label="قیمت" />
      <div className="flex flex-wrap gap-2">
        <FilterSelect
          param="usage"
          label="استفاده"
          options={[
            { value: "all", label: "همه" },
            { value: "used", label: "در فاکتورها" },
            { value: "unused", label: "استفاده‌نشده" },
          ]}
        />
        <FilterSelect
          param="sort"
          label="مرتب‌سازی"
          options={[
            { value: "newest", label: "جدیدترین" },
            { value: "oldest", label: "قدیمی‌ترین" },
            { value: "name", label: "نام (الفبا)" },
            { value: "price_asc", label: "ارزان‌ترین" },
            { value: "price_desc", label: "گران‌ترین" },
          ]}
        />
        <ResetFiltersButton params={["q", "min", "max", "usage", "sort"]} />
      </div>
    </div>
  );
}
