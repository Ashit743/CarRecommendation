import { buildApp } from "./app.js";

const app = buildApp();

try {
  await app.listen({
    host: "0.0.0.0",
    port: app.config?.PORT ?? Number(process.env.PORT ?? 3000),
  });
} catch (error: unknown) {
  app.log.error(error);
  process.exit(1);
}
