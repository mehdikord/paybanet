# پی با نت (PayBaNet)

سامانه صدور فاکتور و لینک پرداخت با سه پنل: **مدیران** (`/admins`)، **فروشندگان** و **مشتریان**.

## Stack

- Next.js 16 (App Router, Cache Components, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix, RTL)
- Prisma 7 + MySQL (driver adapter: `@prisma/adapter-mariadb`)
- Auth: signed JWT (jose) in an httpOnly cookie, bcrypt password hashes, zod validation

## Setup

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then fill in DB credentials and SESSION_SECRET
npm run db:deploy           # apply migrations
npm run db:seed             # create the default admin
npm run dev
```

Default admin (from the seeder): `09120000000` / `password` — change it in production.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `start` | Production build / server |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | Create & apply a new migration (development) |
| `npm run db:deploy` | Apply pending migrations (production) |
| `npm run db:status` | Migration status |
| `npm run db:seed` | Run seeders (idempotent) |
| `npm run db:studio` | Prisma Studio |

## Database conventions (Laravel-style)

- `id` and all foreign keys are `BIGINT UNSIGNED`; every table has `created_at` / `updated_at`.
- Constraint names follow Laravel: `products_seller_id_foreign`, `admins_phone_unique`, …
- One migration per table in `prisma/migrations/*_create_<table>_table`.
- Money (`price`, `total_price`) is `BIGINT UNSIGNED`.
- Deleting a seller cascades to its products/customers/invoices, **but** a customer or
  product that is referenced by an invoice/order is protected (`RESTRICT`). To delete a
  seller who has invoices, delete their invoices first inside a transaction.

Source schema: [`data/schema.md`](data/schema.md) → [`prisma/schema.prisma`](prisma/schema.prisma).

## Project structure

```
src/
  proxy.ts                     # redirects unauthenticated visitors of /admins/* to login
  app/admins/
    login/                     # login page, form, brand panel
    (panel)/                   # authenticated layout (sidebar + header) and dashboard
    actions.ts                 # loginAdmin / logoutAdmin server actions
    session/reset/route.ts     # clears a stale session cookie
  components/admin/            # sidebar, header, user menu, nav config
  lib/auth/                    # session (JWT), DAL (getCurrentAdmin/requireAdmin), rate limit
  lib/validations/             # zod schemas shared by client & server
  lib/db.ts                    # Prisma client singleton
```

### Admin panel sections

| Route | What it does |
| --- | --- |
| `/admins/login` | Admin login (mobile + password, remember me, rate-limited) |
| `/admins` | Dashboard (empty for now) |
| `/admins/sellers` | Sellers list: search (name, mobile, national/economic code), pagination |
| `/admins/sellers/new` | Create a seller (national-code checksum, random password generator) |
| `/admins/sellers/[id]` | Edit a seller (password optional), account summary, delete |

### Seller panel sections

| Route | What it does |
| --- | --- |
| `/sellers/login` | Seller login (separate session from admins) |
| `/sellers` | Dashboard (empty for now) |
| `/sellers/invoices` | Invoices: search (number, customer), Jalali date range with presets, amount range, status, sort; issue/edit in a modal with searchable customer/product pickers and live total; print; copy pay link |
| `/sellers/invoices/[id]/print` | A4 printable invoice («صورتحساب فروش کالا و خدمات») |
| `/sellers/customers` | Customers: search, filters (has invoices, has economic code), sort, pagination; add/edit in a modal |
| `/sellers/products` | Products: search, price range (Toman), usage filter, sort, pagination; add/edit in a modal |

Public payment page: `/customers/payment/<8-digit token>` (token stored in `invoices.pay_link`, UNIQUE, random).
The pay button is a **test payment** (no gateway yet) — see `src/app/customers/payment/[token]/actions.ts`.

### Dates and time zones

- `invoice_date` and all timestamps are stored as UTC `TIMESTAMP`s. The DB connection uses `timezone: "Z"`.
- A calendar day (invoice date) is stored as 00:00 Asia/Tehran of that day.
- Forms and URLs use Gregorian `YYYY-MM-DD`; the UI shows Jalali dates (Persian calendar picker via `@daypicker/persian`).

Customers and products that appear on an invoice cannot be deleted (keeps invoice history intact).
Prices are entered/shown in Toman and stored in Rial (×10).

### Authentication

Each panel has its own cookie (`pb_admin_session` on `/admins`, `pb_seller_session` on `/sellers`)
and its own JWT audience, so a token from one panel is never accepted by the other.
Every seller-owned query is scoped by the signed-in seller's id (see `src/lib/auth/seller.ts`).

Deleting a seller removes their invoices, orders, products and customers in one transaction;
the admin must type the seller's name to confirm.

To add a page to the admin sidebar, add it to `src/components/admin/nav-config.ts`
and create the route under `src/app/admins/(panel)/`. Protect data access with `requireAdmin()`.
