import { Suspense } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { PanelKey } from "./nav-config";
import { NavUserSkeleton } from "./nav-user";
import { PanelHeader } from "./panel-header";
import { PanelSidebar } from "./panel-sidebar";

/**
 * Sidebar + header frame for a panel. `user` is a component that reads the
 * session (e.g. <SidebarUser />), so it is streamed behind a Suspense boundary.
 */
export function PanelShell({
  panel,
  user,
  children,
}: {
  panel: PanelKey;
  user: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PanelSidebar panel={panel} footer={<Suspense fallback={<NavUserSkeleton />}>{user}</Suspense>} />
      <SidebarInset className="min-w-0">
        <PanelHeader panel={panel} />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
