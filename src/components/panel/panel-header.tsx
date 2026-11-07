"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, Suspense } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getBreadcrumbs, type PanelKey } from "./nav-config";
import { ThemeToggle } from "./theme-toggle";

function Breadcrumbs({ panel }: { panel: PanelKey }) {
  const crumbs = getBreadcrumbs(panel, usePathname());

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <Fragment key={crumb.title}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.title}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="font-semibold">{crumb.title}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function PanelHeader({ panel }: { panel: PanelKey }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <SidebarTrigger className="-ms-1" aria-label="باز و بسته کردن منو" />
      <Separator orientation="vertical" className="me-1 data-vertical:h-5 data-vertical:self-center" />
      <Suspense fallback={null}>
        <Breadcrumbs panel={panel} />
      </Suspense>
      <div className="ms-auto flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
