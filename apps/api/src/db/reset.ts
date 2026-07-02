import { sql } from "./client.js";

async function reset() {
  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;
}

reset()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("Failed to reset database", error);
    process.exit(1);
  });
