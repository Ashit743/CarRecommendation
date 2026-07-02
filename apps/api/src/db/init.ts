import { migrate } from "drizzle-orm/postgres-js/migrator";
import { fileURLToPath } from "node:url";

import { db, sql } from "./client.js";
import { seed } from "./seed.js";

const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));

export async function initializeDatabase(options?: { seedIfEmpty?: boolean }) {
  await migrate(db, { migrationsFolder });

  if (options?.seedIfEmpty !== false) {
    await seed({ reset: false });
  }
}

export async function shutdownDatabase() {
  await sql.end({ timeout: 5 });
}
