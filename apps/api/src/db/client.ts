import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://car_app:car_app@localhost:5432/car_app";
const requiresSsl = /render\.com|postgres\.render\.com|neon|supabase|railway/i.test(databaseUrl);

const sql = postgres(databaseUrl, {
  max: 10,
  ...(requiresSsl ? { ssl: "require" } : {}),
});

export const db = drizzle(sql, { schema });
export { sql };
