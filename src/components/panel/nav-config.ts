import {
  FileTextIcon,
  LayoutDashboardIcon,
  PackageIcon,
  StoreIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

export type PanelKey = "admin" | "seller";

export type NavItem = { title: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };
export type Breadcrumb = { title: string; href?: string };

type PanelConfig = {
  /** Shown under the logo in the sidebar. */
  label: string;
  homeHref: string;
  nav: NavGroup[];
  /** Breadcrumb trails by route; the last crumb is the current page. */
  routes: { pattern: RegExp; crumbs: Breadcrumb[] }[];
};

export const PANELS: Record<PanelKey, PanelConfig> = {
  admin: {
    label: "پنل مدیریت",
    homeHref: "/admins",
    nav: [
      {
        label: "عمومی",
        items: [{ title: "داشبورد", href: "/admins", icon: LayoutDashboardIcon }],
      },
      {
        label: "کاربران",
        items: [{ title: "فروشندگان", href: "/admins/sellers", icon: StoreIcon }],
      },
    ],
    routes: [
      { pattern: /^\/admins$/, crumbs: [{ title: "داشبورد" }] },
      { pattern: /^\/admins\/sellers$/, crumbs: [{ title: "فروشندگان" }] },
      {
        pattern: /^\/admins\/sellers\/new$/,
        crumbs: [{ title: "فروشندگان", href: "/admins/sellers" }, { title: "فروشنده جدید" }],
      },
      {
        pattern: /^\/admins\/sellers\/[^/]+$/,
        crumbs: [{ title: "فروشندگان", href: "/admins/sellers" }, { title: "ویرایش فروشنده" }],
      },
      {
        pattern: /^\/admins\/sellers\/[^/]+\/invoices$/,
        crumbs: [{ title: "فروشندگان", href: "/admins/sellers" }, { title: "فاکتورهای فروشنده" }],
      },
      {
        pattern: /^\/admins\/sellers\/[^/]+\/products$/,
        crumbs: [{ title: "فروشندگان", href: "/admins/sellers" }, { title: "محصولات فروشنده" }],
      },
      {
        pattern: /^\/admins\/sellers\/[^/]+\/customers$/,
        crumbs: [{ title: "فروشندگان", href: "/admins/sellers" }, { title: "مشتریان فروشنده" }],
      },
    ],
  },
  seller: {
    label: "پنل فروشنده",
    homeHref: "/sellers",
    nav: [
      {
        label: "عمومی",
        items: [{ title: "داشبورد", href: "/sellers", icon: LayoutDashboardIcon }],
      },
      {
        label: "فروشگاه",
        items: [
          { title: "فاکتورها", href: "/sellers/invoices", icon: FileTextIcon },
          { title: "مشتریان", href: "/sellers/customers", icon: UsersIcon },
          { title: "محصولات", href: "/sellers/products", icon: PackageIcon },
        ],
      },
    ],
    routes: [
      { pattern: /^\/sellers$/, crumbs: [{ title: "داشبورد" }] },
      { pattern: /^\/sellers\/invoices$/, crumbs: [{ title: "فاکتورها" }] },
      { pattern: /^\/sellers\/customers$/, crumbs: [{ title: "مشتریان" }] },
      { pattern: /^\/sellers\/products$/, crumbs: [{ title: "محصولات" }] },
    ],
  },
};

export function isNavItemActive(panel: PanelKey, href: string, pathname: string) {
  return href === PANELS[panel].homeHref
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
}

export function getBreadcrumbs(panel: PanelKey, pathname: string): Breadcrumb[] {
  return (
    PANELS[panel].routes.find((route) => route.pattern.test(pathname))?.crumbs ?? [
      { title: PANELS[panel].label },
    ]
  );
}
