# Schema: paybanet
Database: mysql
Tables: 6
Columns are NOT NULL unless marked nullable.

## admins
id: bigint PK auto unsigned
name: varchar
phone: varchar
password: varchar
created_at: timestamp nullable
updated_at: timestamp nullable

## sellers
id: bigint PK auto unsigned
name: varchar
phone: varchar
password: varchar
national_code: varchar nullable
economic_code: varchar nullable
created_at: timestamp nullable
updated_at: timestamp nullable

## products
id: bigint PK auto unsigned
seller_id: bigint FK
name: varchar
code: varchar
price: varchar
description: varchar nullable
image: varchar nullable
created_at: timestamp nullable
updated_at: timestamp nullable

## customers
id: bigint PK auto unsigned
seller_id: bigint FK
name: varchar
phone: varchar
economic_code: varchar nullable
description: varchar nullable
created_at: timestamp nullable
updated_at: timestamp nullable

## invoices
id: bigint PK auto unsigned
seller_id: bigint FK
customer_id: bigint FK
invoice_date: timestamp nullable
total_price: timestamp nullable
paid: boolean default:0
pay_link: varchar nullable
link_views: varchar default:0
paid_at: timestamp nullable
created_at: timestamp nullable
updated_at: timestamp nullable

## orders
id: bigint PK auto unsigned
invoice_id: bigint
product_id: bigint
quantity: varchar
price: bigint
created_at: timestamp
update_at: timestamp

## Relationships
customers.seller_id → sellers.id (one-to-one)
products.seller_id → sellers.id (one-to-one)
invoices.seller_id → sellers.id (one-to-one)
invoices.customer_id → customers.id (one-to-one)

---
If you suggest changes to this schema, ALSO return them as a DrawSQL patch: one fenced ```json code block, so I can apply them to my diagram. If you are only answering a question, skip the patch.

Patch rules:
- One JSON object with "strategy": "merge"; combine every change into that single patch.
- Reference tables and columns by name. Only include what changes — omit unchanged columns and unused optional fields.
- Column: {"name","type","length","is_primary_key","is_auto_increment","is_nullable","is_unique_key","is_index","is_unsigned","default","enum_values"} — use exact type names for mysql as shown in the schema above.
- Relationship: {"type":"one-to-many","source_table":"users","source_column":"id","target_table":"posts","target_column":"user_id"} — for "one-to-many" the source is the "one" side; for "many-to-one" the source is the "many" (foreign-key) side. Prefer "one-to-many".
- Add "default_type" ("string" | "function" | "number" | "boolean") when a default could be misread — a literal string "CURRENT_TIMESTAMP" or "0" needs "default_type":"string".
- SET columns (MySQL) list their members in "set_values", not "enum_values".
- Index: {"indexes":[{"name":"idx_posts_user_created","type":"index","columns":["user_id","created_at"]}]} on its table — "type" is "index" or "unique"; delete via "deletions".
- Group: {"name":"Billing"}. A group never lists its members — put "parent_name":"Billing" on each table that belongs to it.
- Sticky note: {"sticky_notes":[{"content":"..."}]}.
- Delete via "deletions"; rename via "old_name". Do not include left/top coordinates.

Examples:
Add table: `{"strategy":"merge","tables":[{"name":"posts","comment":"Blog posts","columns":[{"name":"id","type":"bigint","is_primary_key":true,"is_auto_increment":true},{"name":"user_id","type":"bigint","is_index":true},{"name":"title","type":"varchar","length":255},{"name":"body","type":"text","is_nullable":true},{"name":"created_at","type":"timestamp","is_nullable":true},{"name":"updated_at","type":"timestamp","is_nullable":true}]}]}`
Rename table and column (use old_name only when renaming): `{"strategy":"merge","tables":[{"name":"articles","old_name":"posts","columns":[{"name":"content","old_name":"body"}]}]}`
Delete: `{"strategy":"merge","deletions":{"tables":["tmp"],"columns":[{"table":"users","columns":["legacy"]}],"relationships":[{"source_table":"users","source_column":"id","target_table":"posts","target_column":"user_id"}]}}`
Multiple groups with nested tables (every table sets parent_name): `{"strategy":"merge","groups":[{"name":"Auth"},{"name":"Content"}],"tables":[{"name":"users","parent_name":"Auth","columns":[{"name":"id","type":"bigint","is_primary_key":true,"is_auto_increment":true}]},{"name":"roles","parent_name":"Auth","columns":[{"name":"id","type":"bigint","is_primary_key":true,"is_auto_increment":true}]},{"name":"posts","parent_name":"Content","columns":[{"name":"id","type":"bigint","is_primary_key":true,"is_auto_increment":true}]}]}`
