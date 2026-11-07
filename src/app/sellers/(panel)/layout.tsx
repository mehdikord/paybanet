import { logoutSeller } from "@/app/sellers/actions";
import { NavUser } from "@/components/panel/nav-user";
import { PanelShell } from "@/components/panel/panel-shell";
import { requireSeller } from "@/lib/auth/seller";

async function SidebarUser() {
  const seller = await requireSeller();
  return <NavUser user={seller} logout={logoutSeller} />;
}

export default function SellerPanelLayout({ children }: LayoutProps<"/sellers">) {
  return (
    <PanelShell panel="seller" user={<SidebarUser />}>
      {children}
    </PanelShell>
  );
}
