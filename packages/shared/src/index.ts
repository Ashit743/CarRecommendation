import { z } from "zod";

export const segmentSchema = z.enum(["hatchback", "sedan", "compact-suv", "mid-suv", "mpv", "ev"]);
export const fuelTypeSchema = z.enum(["petrol", "diesel", "cng", "hybrid", "electric"]);
export const transmissionSchema = z.enum(["manual", "automatic", "amt", "cvt", "dct"]);

export const carImageSchema = z.object({
  id: z.number().int().positive(),
  carId: z.number().int().positive(),
  imageUrl: z.string().url(),
  altText: z.string().min(1),
  sortOrder: z.number().int().min(0).default(0),
});

export const carSchema = z.object({
  id: z.number().int().positive(),
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
  images: z.array(carImageSchema).default([]),
});

export const reviewSchema = z.object({
  id: z.number().int().positive(),
  carId: z.number().int().positive(),
  reviewerName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1),
  comment: z.string().min(1),
  pros: z.array(z.string().min(1)).default([]),
  cons: z.array(z.string().min(1)).default([]),
});

export const questionnaireInputSchema = z.object({
  budgetLakh: z.number().positive(),
  cityDrivingPercent: z.number().min(0).max(100),
  highwayDrivingPercent: z.number().min(0).max(100),
  familySize: z.number().int().min(1).max(10),
  safetyPriority: z.number().int().min(1).max(5),
  fuelPreference: fuelTypeSchema,
  transmissionPreference: transmissionSchema,
  preferredSegments: z.array(segmentSchema).min(1),
  featurePriorities: z.array(z.string().min(1)).min(1),
}).superRefine((value, ctx) => {
  if (value.cityDrivingPercent + value.highwayDrivingPercent !== 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "City and highway usage percentages must add up to 100.",
      path: ["cityDrivingPercent"],
    });
  }
});

export const questionaireInputSchema = questionnaireInputSchema;

export const scoreBreakdownSchema = z.object({
  budgetFit: z.number().min(0).max(35),
  useCaseMatch: z.number().min(0).max(25),
  featureMatch: z.number().min(0).max(20),
  safety: z.number().min(0).max(12),
  efficiency: z.number().min(0).max(8),
  total: z.number().min(0).max(100),
});

export const recommendationItemSchema = z.object({
  car: carSchema,
  score: scoreBreakdownSchema,
  explanation: z.string().min(1),
});

export const recommendationResultSchema = z.object({
  recommendations: z.array(recommendationItemSchema),
  summary: z.string().min(1),
});

export type Segment = z.infer<typeof segmentSchema>;
export type FuelType = z.infer<typeof fuelTypeSchema>;
export type Transmission = z.infer<typeof transmissionSchema>;
export type CarImage = z.infer<typeof carImageSchema>;
export type Car = z.infer<typeof carSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type QuestionnaireInput = z.infer<typeof questionnaireInputSchema>;
export type ScoreBreakdown = z.infer<typeof scoreBreakdownSchema>;
export type RecommendationItem = z.infer<typeof recommendationItemSchema>;
export type RecommendationResult = z.infer<typeof recommendationResultSchema>;
