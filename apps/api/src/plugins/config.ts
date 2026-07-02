import { fileURLToPath } from "node:url";
import fastifyEnv from "@fastify/env";
import fp from "fastify-plugin";
import { z } from "zod";

const configSchema = z.object({
  DATABASE_URL: z.string().min(1),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-1.5-flash"),
  PORT: z.coerce.number().int().positive().default(3000),
});

export const configPlugin = fp(async (app) => {
  await app.register(fastifyEnv, {
    confKey: "config",
    dotenv: {
      path: fileURLToPath(new URL("../../../../.env", import.meta.url)),
    },
    schema: {
      type: "object",
      required: ["DATABASE_URL"],
      properties: {
        DATABASE_URL: { type: "string" },
        GOOGLE_GENERATIVE_AI_API_KEY: { type: "string" },
        GEMINI_MODEL: { type: "string", default: "gemini-1.5-flash" },
        PORT: { type: "number", default: 3000 },
      },
    },
    data: process.env,
  });

  app.config = configSchema.parse(app.config);
});
