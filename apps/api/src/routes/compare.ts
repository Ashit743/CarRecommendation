import { z } from "zod";

import { carSchema, reviewSchema } from "@car-app/shared";

import { getCarsByIds } from "../services/catalogService.js";
import type { FastifyPluginAsyncZod } from "../utils/fastifyTypes.js";

const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

const compareQuerySchema = z.object({
  ids: z
    .string()
    .transform((value) => {
      return value
        .split(",")
        .map((entry) => Number(entry.trim()))
        .filter((entry) => Number.isInteger(entry) && entry > 0);
    })
    .refine((value) => value.length >= 2 && value.length <= 4, {
      message: "Provide between 2 and 4 car ids.",
    }),
});

const compareCarSchema = carSchema.extend({
  reviews: z.array(reviewSchema),
});

const compareResponseSchema = z.object({
  cars: z.array(compareCarSchema).min(2),
  highlights: z.object({
    bestSafetyCarId: z.number().int().positive(),
    bestValueCarId: z.number().int().positive(),
    bestEfficiencyCarId: z.number().int().positive(),
  }),
  commonTags: z.array(z.string()),
});

export const compareRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/compare", {
    schema: {
      querystring: compareQuerySchema,
      response: {
        200: compareResponseSchema,
        404: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    const query = request.query as z.infer<typeof compareQuerySchema>;
    const cars = await getCarsByIds(query.ids);

    if (cars.length !== query.ids.length) {
      return reply.code(404).send({
        error: "One or more cars could not be found.",
        code: "COMPARE_CARS_NOT_FOUND",
      });
    }

    const bestSafetyCar = [...cars].sort((left, right) => right.safetyStars - left.safetyStars)[0];
    const bestValueCar = [...cars].sort((left, right) => left.priceLakh - right.priceLakh)[0];
    const bestEfficiencyCar = [...cars].sort((left, right) => {
      const leftMetric = left.fuelType === "electric" ? left.evRangeKm ?? 0 : left.mileageKmpl ?? 0;
      const rightMetric = right.fuelType === "electric" ? right.evRangeKm ?? 0 : right.mileageKmpl ?? 0;
      return rightMetric - leftMetric;
    })[0];
    const commonTags = cars
      .map((car) => new Set(car.tags))
      .reduce<string[]>((sharedTags, tags, index) => {
        if (index === 0) {
          return [...tags];
        }

        return sharedTags.filter((tag) => tags.has(tag));
      }, []);

    return {
      cars,
      highlights: {
        bestSafetyCarId: bestSafetyCar.id,
        bestValueCarId: bestValueCar.id,
        bestEfficiencyCarId: bestEfficiencyCar.id,
      },
      commonTags,
    };
  });
};
