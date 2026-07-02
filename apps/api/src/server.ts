import cors from "@fastify/cors";
import Fastify from "fastify";
import type { ZodTypeAny } from "zod";
import { z } from "zod";

import {
  questionnaireInputSchema,
  recommendationResultSchema,
  type QuestionnaireInput,
  type RecommendationResult,
} from "@car-app/shared";

import { buildTemplateRecommendation } from "./llm/templateFallback.js";

const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

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

await app.register(cors, {
  origin: true,
});

app.get("/health", async () => {
  return { status: "ok" };
});

app.post("/recommend", {
  schema: {
    body: questionnaireInputSchema,
    response: {
      200: recommendationResultSchema,
      500: apiErrorSchema,
    },
  },
}, async (request, reply) => {
  const input = request.body as QuestionnaireInput;

  const result: RecommendationResult = buildTemplateRecommendation(input);

  const parsed = recommendationResultSchema.safeParse(result);

  if (!parsed.success) {
    return reply.code(500).send({
      error: "Failed to build recommendation response.",
      code: "RECOMMENDATION_SERIALIZATION_ERROR",
    });
  }

  return parsed.data;
});

const port = Number(process.env.PORT ?? 3000);

try {
  await app.listen({
    host: "0.0.0.0",
    port,
  });
} catch (error: unknown) {
  app.log.error(error);
  process.exit(1);
}
