/**
 * Database seeder — `npx prisma db seed`
 *
 * Idempotent: running it more than once will not create duplicates.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import { databaseConfig } from "../src/lib/db-config";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(databaseConfig(2)),
});

async function seedAdmins() {
  const admin = {
    name: "Admin",
    phone: "09120000000",
    password: "password",
  };

  const result = await prisma.admin.upsert({
    where: { phone: admin.phone },
    update: {},
    create: {
      name: admin.name,
      phone: admin.phone,
      password: await bcrypt.hash(admin.password, 12),
    },
  });

  console.log(`✔ AdminSeeder: #${result.id} ${result.name} (${result.phone})`);
}

async function main() {
  await seedAdmins();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
