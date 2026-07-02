import { z } from "zod";

import {
  carSchema,
  fuelTypeSchema,
  reviewSchema,
  segmentSchema,
  transmissionSchema,
} from "@car-app/shared";

import {
  createCar,
  deleteCar,
  getCarById,
  listCars,
  updateCar,
} from "../services/catalogService.js";
import type { FastifyPluginAsyncZod } from "../utils/fastifyTypes.js";

const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

const baseCarPayloadSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  priceLakh: z.number().nonnegative(),
  safetyStars: z.number().int().min(0).max(5),
  mileageKmpl: z.number().nonnegative().nullable(),
  evRangeKm: z.number().int().positive().nullable(),
  segment: segmentSchema,
  fuelType: fuelTypeSchema,
  transmission: transmissionSchema,
  tags: z.array(z.string().min(1)),
  specs: z.record(z.string(), z.unknown()),
});

function refineCarPayload<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value, ctx) => {
    const candidate = value as z.infer<typeof baseCarPayloadSchema>;

    if (candidate.fuelType === undefined) {
      return;
    }

    if (candidate.fuelType === "electric" && candidate.mileageKmpl !== null && candidate.mileageKmpl !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "EV cars must store mileageKmpl as null.",
        path: ["mileageKmpl"],
      });
    }

    if (candidate.fuelType !== "electric" && candidate.evRangeKm !== null && candidate.evRangeKm !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ICE and hybrid cars must store evRangeKm as null.",
        path: ["evRangeKm"],
      });
    }
  });
}

const carPayloadSchema = refineCarPayload(baseCarPayloadSchema);
const partialCarPayloadSchema = refineCarPayload(baseCarPayloadSchema.partial());

const carListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional(),
  segment: segmentSchema.optional(),
  fuelType: fuelTypeSchema.optional(),
  transmission: transmissionSchema.optional(),
  minPriceLakh: z.coerce.number().nonnegative().optional(),
  maxPriceLakh: z.coerce.number().nonnegative().optional(),
  tags: z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value : value.split(",").map((entry) => entry.trim()).filter(Boolean)))
    .optional(),
});

const carResponseSchema = carSchema.extend({
  reviews: z.array(reviewSchema),
});

const paginatedCarsSchema = z.object({
  items: z.array(carResponseSchema),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().positive(),
});

const carIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const carsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/cars", {
    schema: {
      querystring: carListQuerySchema,
      response: {
        200: paginatedCarsSchema,
      },
    },
  }, async (request) => {
    const query = request.query as z.infer<typeof carListQuerySchema>;

    return listCars(query);
  });

  app.get("/cars/:id", {
    schema: {
      params: carIdParamSchema,
      response: {
        200: carResponseSchema,
        404: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    const params = request.params as z.infer<typeof carIdParamSchema>;
    const car = await getCarById(params.id);

    if (!car) {
      return reply.code(404).send({
        error: "Car not found.",
        code: "CAR_NOT_FOUND",
      });
    }

    return car;
  });

  app.post("/cars", {
    schema: {
      body: carPayloadSchema,
      response: {
        201: carResponseSchema,
        400: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    const body = request.body as z.infer<typeof carPayloadSchema>;
    const created = await createCar(body);

    return reply.code(201).send(created);
  });

  app.patch("/cars/:id", {
    schema: {
      params: carIdParamSchema,
      body: partialCarPayloadSchema,
      response: {
        200: carResponseSchema,
        404: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    const params = request.params as z.infer<typeof carIdParamSchema>;
    const body = request.body as Partial<z.infer<typeof baseCarPayloadSchema>>;
    const updated = await updateCar(params.id, body);

    if (!updated) {
      return reply.code(404).send({
        error: "Car not found.",
        code: "CAR_NOT_FOUND",
      });
    }

    return updated;
  });

  app.delete("/cars/:id", {
    schema: {
      params: carIdParamSchema,
      response: {
        200: z.object({ success: z.literal(true) }),
        404: apiErrorSchema,
      },
    },
  }, async (request, reply) => {
    const params = request.params as z.infer<typeof carIdParamSchema>;
    const deleted = await deleteCar(params.id);

    if (!deleted) {
      return reply.code(404).send({
        error: "Car not found.",
        code: "CAR_NOT_FOUND",
      });
    }

    return { success: true };
  });
};
