"use client";

import { AmountRangeFilter } from "@/components/data/amount-range-filter";
import { DateRangeFilter } from "@/components/data/date-range-filter";
import { FilterSelect } from "@/components/data/filter-select";
import { ResetFiltersButton } from "@/components/data/reset-filters-button";
import { SearchInput } from "@/components/data/search-input";

export function InvoicesToolbar() {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchInput placeholder="شماره فاکتور، نام یا موبایل مشتری" label="جستجوی فاکتورها" />
        <DateRangeFilter label="تاریخ فاکتور" />
        <AmountRangeFilter label="مبلغ" />
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterSelect
          param="status"
          label="وضعیت"
          options={[
            { value: "all", label: "همه" },
            { value: "paid", label: "پرداخت‌شده" },
            { value: "unpaid", label: "پرداخت‌نشده" },
          ]}
        />
        <FilterSelect
          param="sort"
          label="مرتب‌سازی"
          options={[
            { value: "date_desc", label: "تاریخ فاکتور (جدیدترین)" },
            { value: "date_asc", label: "تاریخ فاکتور (قدیمی‌ترین)" },
            { value: "amount_desc", label: "بیشترین مبلغ" },
            { value: "amount_asc", label: "کمترین مبلغ" },
            { value: "created_desc", label: "آخرین صادرشده" },
          ]}
        />
        <ResetFiltersButton params={["q", "from", "to", "min", "max", "status", "sort"]} />
      </div>
    </div>
  );
}
