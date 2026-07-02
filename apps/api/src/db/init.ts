import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db, sql } from "./client.js";
import { seed } from "./seed.js";

function resolveMigrationsFolder() {
  const candidates = [
    resolve(process.cwd(), "apps/api/drizzle"),
    resolve(process.cwd(), "drizzle"),
    resolve(process.cwd(), "apps/api/dist/../drizzle"),
  ];

  const existing = candidates.find((candidate) => existsSync(candidate));

  if (!existing) {
    throw new Error(`Could not find drizzle migrations folder. Checked: ${candidates.join(", ")}`);
  }

  return existing;
}

export async function initializeDatabase(options?: { seedIfEmpty?: boolean }) {
  const migrationsFolder = resolveMigrationsFolder();

  await migrate(db, { migrationsFolder });

  if (options?.seedIfEmpty !== false) {
    await seed({ reset: false });
  }
}

export async function shutdownDatabase() {
  await sql.end({ timeout: 5 });
}
