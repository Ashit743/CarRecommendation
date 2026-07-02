import type { db, sql } from "../db/client.js";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
      GOOGLE_GENERATIVE_AI_API_KEY?: string;
      GEMINI_MODEL: string;
      PORT: number;
    };
    db: typeof db;
    sql: typeof sql;
  }
}
