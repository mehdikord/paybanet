"use client";

import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";
import { useTransition } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
/** What the menu shows about the signed-in user. */
export type PanelUser = { id: string; name: string; phone: string };
import { toPersianDigits } from "@/lib/phone";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function Identity({ user }: { user: PanelUser }) {
  return (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarFallback className="rounded-lg bg-sidebar-primary font-bold text-sidebar-primary-foreground">
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-start leading-tight">
        <span className="truncate font-semibold">{user.name}</span>
        <span dir="ltr" className="truncate text-end text-xs opacity-70">
          {toPersianDigits(user.phone)}
        </span>
      </div>
    </>
  );
}

export function NavUser({ user, logout }: { user: PanelUser; logout: () => Promise<void> }) {
  const { isMobile } = useSidebar();
  const [isLoggingOut, startLogout] = useTransition();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label="منوی حساب کاربری"
            >
              <Identity user={user} />
              <ChevronsUpDownIcon className="ms-auto size-4 opacity-60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "left"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="flex items-center gap-2 p-1.5 font-normal">
              <Identity user={user} />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isLoggingOut}
              onSelect={(event) => {
                event.preventDefault();
                startLogout(() => logout());
              }}
            >
              {isLoggingOut ? <Spinner /> : <LogOutIcon />}
              خروج از حساب
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function NavUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuSkeleton showIcon className="h-12" />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
