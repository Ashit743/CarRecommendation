import fp from "fastify-plugin";

import { db, sql } from "../db/client.js";

export const drizzlePlugin = fp(async (app) => {
  app.decorate("db", db);
  app.decorate("sql", sql);

  app.addHook("onClose", async () => {
    await sql.end({ timeout: 5 });
  });
});
