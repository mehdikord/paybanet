"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { Logo } from "@/components/brand/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { isNavItemActive, PANELS, type PanelKey } from "./nav-config";

/** Menu items; `pathname` is null while the URL is still streaming in. */
function NavMenu({ panel, pathname }: { panel: PanelKey; pathname: string | null }) {
  const { isMobile, setOpenMobile } = useSidebar();

  return PANELS[panel].nav.map((group) => (
    <SidebarGroup key={group.label}>
      <SidebarGroupLabel className="text-sidebar-foreground/60">{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => {
            const active = pathname !== null && isNavItemActive(panel, item.href, pathname);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className="relative h-10 data-[active=true]:bg-sidebar-accent data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:[&>svg]:text-sidebar-primary data-[active=true]:before:absolute data-[active=true]:before:inset-y-2 data-[active=true]:before:start-0 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-full data-[active=true]:before:bg-sidebar-primary"
                >
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ));
}

function ActiveNavMenu({ panel }: { panel: PanelKey }) {
  return <NavMenu panel={panel} pathname={usePathname()} />;
}

export function PanelSidebar({ panel, footer }: { panel: PanelKey; footer: React.ReactNode }) {
  const config = PANELS[panel];
  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="h-16 justify-center px-3">
        <Link
          href={config.homeHref}
          className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          aria-label={`پی با نت، ${config.label}`}
        >
          <Logo className="text-white" wordmarkClassName="group-data-[collapsible=icon]:hidden" />
          <span className="rounded-md bg-sidebar-accent px-1.5 py-0.5 text-xs text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            {config.label}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <Suspense fallback={<NavMenu panel={panel} pathname={null} />}>
          <ActiveNavMenu panel={panel} />
        </Suspense>
      </SidebarContent>

      <SidebarFooter>{footer}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
