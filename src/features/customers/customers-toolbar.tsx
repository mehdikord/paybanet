"use client";

import { FilterSelect } from "@/components/data/filter-select";
import { ResetFiltersButton } from "@/components/data/reset-filters-button";
import { SearchInput } from "@/components/data/search-input";

export function CustomersToolbar() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput placeholder="جستجوی نام، موبایل، کد اقتصادی" label="جستجوی مشتریان" />
      <div className="flex flex-wrap gap-2">
        <FilterSelect
          param="invoices"
          label="فاکتور"
          options={[
            { value: "all", label: "همه" },
            { value: "with", label: "دارای فاکتور" },
            { value: "without", label: "بدون فاکتور" },
          ]}
        />
        <FilterSelect
          param="economic"
          label="کد اقتصادی"
          options={[
            { value: "all", label: "همه" },
            { value: "with", label: "دارد" },
            { value: "without", label: "ندارد" },
          ]}
        />
        <FilterSelect
          param="sort"
          label="مرتب‌سازی"
          options={[
            { value: "newest", label: "جدیدترین" },
            { value: "oldest", label: "قدیمی‌ترین" },
            { value: "name", label: "نام (الفبا)" },
            { value: "invoices", label: "بیشترین فاکتور" },
          ]}
        />
        <ResetFiltersButton params={["q", "invoices", "economic", "sort"]} />
      </div>
    </div>
  );
}
