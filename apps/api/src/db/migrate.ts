import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db, sql } from "./client.js";

const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));

async function runMigrations() {
  await migrate(db, {
    migrationsFolder,
  });
}

runMigrations()
  .then(async () => {
    await sql.end();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error("Failed to run migrations", error);
    await sql.end({ timeout: 5 });
    process.exit(1);
  });
