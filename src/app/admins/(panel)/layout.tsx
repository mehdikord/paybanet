import { logoutAdmin } from "@/app/admins/actions";
import { NavUser } from "@/components/panel/nav-user";
import { PanelShell } from "@/components/panel/panel-shell";
import { requireAdmin } from "@/lib/auth/admin";

async function SidebarUser() {
  const admin = await requireAdmin();
  return <NavUser user={admin} logout={logoutAdmin} />;
}

export default function AdminPanelLayout({ children }: LayoutProps<"/admins">) {
  return (
    <PanelShell panel="admin" user={<SidebarUser />}>
      {children}
    </PanelShell>
  );
}
