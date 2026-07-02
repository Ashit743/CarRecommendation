import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db, sql } from "./client.js";

function resolveMigrationsFolder() {
  const currentFile = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFile);
  const candidates = [
    resolve(currentDir, "../../drizzle"),
    resolve(currentDir, "../drizzle"),
    resolve(process.cwd(), "apps/api/drizzle"),
    resolve(process.cwd(), "apps/api/dist/drizzle"),
    resolve(process.cwd(), "drizzle"),
    resolve(process.cwd(), "dist/drizzle"),
    resolve(process.cwd(), "..", "drizzle"),
  ];

  const existing = candidates.find((candidate) => existsSync(resolve(candidate, "meta", "_journal.json")) || existsSync(candidate));

  if (!existing) {
    throw new Error(`Could not find drizzle migrations folder. Checked: ${candidates.join(", ")}`);
  }

  return existing;
}

async function runMigrations() {
  await migrate(db, {
    migrationsFolder: resolveMigrationsFolder(),
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
