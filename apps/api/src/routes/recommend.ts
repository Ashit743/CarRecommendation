import { z } from "zod";

import { questionnaireInputSchema, recommendationResultSchema } from "@car-app/shared";

import { listAllCars } from "../services/catalogService.js";
import { buildRecommendationNarrative } from "../services/llmService.js";
import { rankRecommendations } from "../services/scoringService.js";
import type { FastifyPluginAsyncZod } from "../utils/fastifyTypes.js";

const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const recommendRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/recommend", {
    schema: {
      body: questionnaireInputSchema,
      response: {
        200: recommendationResultSchema,
        500: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    const input = request.body as z.infer<typeof questionnaireInputSchema>;
    const cars = await listAllCars();
    const ranked = rankRecommendations(input, cars);

    const result = await buildRecommendationNarrative({
      apiKey: app.config.GOOGLE_GENERATIVE_AI_API_KEY,
      input,
      model: app.config.GEMINI_MODEL,
      recommendations: ranked,
    });

    const parsed = recommendationResultSchema.safeParse(result);

    if (!parsed.success) {
      return reply.code(500).send({
        error: "Failed to build recommendation response.",
        code: "RECOMMENDATION_RESPONSE_INVALID",
      });
    }

    return parsed.data;
  });
};
