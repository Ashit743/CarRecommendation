import cors from "@fastify/cors";
import Fastify from "fastify";
import type { ZodTypeAny } from "zod";
import { ZodError } from "zod";

import { compareRoutes } from "./routes/compare.js";
import { carsRoutes } from "./routes/cars.js";
import { recommendRoutes } from "./routes/recommend.js";
import { configPlugin } from "./plugins/config.js";
import { drizzlePlugin } from "./plugins/drizzle.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.setValidatorCompiler(({ schema }: { schema: ZodTypeAny }) => {
    return (value: unknown) => {
      const parsed = schema.safeParse(value);

      if (parsed.success) {
        return { value: parsed.data };
      }

      return { error: parsed.error };
    };
  });

  app.setSerializerCompiler(({ schema }: { schema: ZodTypeAny }) => {
    return (value: unknown) => {
      const parsed = schema.safeParse(value);

      if (!parsed.success) {
        throw parsed.error;
      }

      return JSON.stringify(parsed.data);
    };
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: error.issues[0]?.message ?? "Validation failed.",
        code: "VALIDATION_ERROR",
      });
    }

    app.log.error(error);

    return reply.code(500).send({
      error: "Internal server error.",
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  app.register(configPlugin);
  app.register(cors, { origin: true });
  app.register(drizzlePlugin);

  app.get("/health", async () => ({ status: "ok" }));
  app.register(carsRoutes, { prefix: "/api" });
  app.register(recommendRoutes, { prefix: "/api" });
  app.register(compareRoutes, { prefix: "/api" });

  return app;
}
