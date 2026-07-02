import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.js";

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://car_app:car_app@localhost:5432/car_app";

const sql = postgres(databaseUrl, {
  max: 10,
});

export const db = drizzle(sql, { schema });
export { sql };
