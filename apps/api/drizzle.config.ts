import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL ?? "postgresql://car_app:car_app@localhost:5432/car_app";

const requiresSsl = /render\.com|postgres\.render\.com|neon|supabase|railway/i.test(databaseUrl);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
    ...(requiresSsl ? { ssl: "require" } : {}),
  },
});
