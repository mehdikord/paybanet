"use client";

import { FileSpreadsheetIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSellerScope } from "@/features/seller-scope";
import { scopePaths } from "@/features/seller-scope-paths";

function fileNameFrom(disposition: string | null) {
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) return decodeURIComponent(encoded);
  return disposition?.match(/filename="([^"]+)"/i)?.[1] ?? "invoices.xlsx";
}

/** Downloads every invoice matching the current filters (all pages) as Excel. */
export function ExportInvoicesButton() {
  const searchParams = useSearchParams();
  const exportPath = scopePaths(useSellerScope()).invoiceExport;
  const [pending, setPending] = useState(false);

  const download = async () => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    const qs = params.toString();
    setPending(true);
    try {
      const response = await fetch(qs ? `${exportPath}?${qs}` : exportPath, { cache: "no-store" });
      const type = response.headers.get("content-type") ?? "";
      if (!response.ok || !type.includes("spreadsheetml")) throw new Error(String(response.status));

      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = fileNameFrom(response.headers.get("content-disposition"));
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("گزارش اکسل آماده شد.");
    } catch {
      toast.error("دریافت گزارش انجام نشد. دوباره تلاش کنید.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button size="lg" variant="outline" onClick={download} disabled={pending}>
      {pending ? <Spinner /> : <FileSpreadsheetIcon />}
      {pending ? "در حال آماده‌سازی…" : "دریافت گزارش"}
    </Button>
  );
}

export function ExportInvoicesButtonFallback() {
  return (
    <Button size="lg" variant="outline" disabled>
      <FileSpreadsheetIcon />
      دریافت گزارش
    </Button>
  );
}
