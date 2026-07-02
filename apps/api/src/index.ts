import { buildApp } from "./app.js";
import { initializeDatabase, shutdownDatabase } from "./db/init.js";

const app = buildApp();

try {
  await initializeDatabase();

  await app.listen({
    host: "0.0.0.0",
    port: app.config?.PORT ?? Number(process.env.PORT ?? 3000),
  });
} catch (error: unknown) {
  app.log.error(error);
  process.exit(1);
}

process.on("SIGTERM", async () => {
  await shutdownDatabase();
  process.exit(0);
});
