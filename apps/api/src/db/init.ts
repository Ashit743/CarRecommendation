import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { db, sql } from "./client.js";
import { seed } from "./seed.js";

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
    return null;
  }

  return existing;
}

export async function initializeDatabase(options?: { seedIfEmpty?: boolean }) {
  const migrationsFolder = resolveMigrationsFolder();

  if (!migrationsFolder) {
    console.warn("Drizzle migrations folder was not found at runtime; skipping migrations.");
    return;
  }

  await migrate(db, { migrationsFolder });

  if (options?.seedIfEmpty !== false) {
    await seed({ reset: false });
  }
}

export async function shutdownDatabase() {
  await sql.end({ timeout: 5 });
}
