import { and, asc, desc, eq, gte, ilike, inArray, lte, sql } from "drizzle-orm";

import type { Car, CarImage, Review } from "@car-app/shared";

import { db } from "../db/client.js";
import { carImages, cars, reviews } from "../db/schema.js";

export const carMutationSchema = {
  name: true,
};

export type CarRecord = Car & { reviews: Review[] };

export type ListCarsFilters = {
  fuelType?: Car["fuelType"];
  limit: number;
  maxPriceLakh?: number;
  minPriceLakh?: number;
  page: number;
  search?: string;
  segment?: Car["segment"];
  tags?: string[];
  transmission?: Car["transmission"];
};

export type PaginatedCars = {
  items: CarRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type DbCarWithRelations = Awaited<ReturnType<typeof db.query.cars.findFirst>>;

function mapImage(image: typeof carImages.$inferSelect): CarImage {
  return {
    id: image.id,
    carId: image.carId,
    imageUrl: image.imageUrl,
    altText: image.altText,
    sortOrder: image.sortOrder,
  };
}

function mapReview(review: typeof reviews.$inferSelect): Review {
  return {
    id: review.id,
    carId: review.carId,
    reviewerName: review.reviewerName,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    pros: review.pros,
    cons: review.cons,
  };
}

function mapCarRecord(
  row: NonNullable<DbCarWithRelations> & {
    images: typeof carImages.$inferSelect[];
    reviews: typeof reviews.$inferSelect[];
  },
): CarRecord {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    priceLakh: Number(row.priceLakh),
    safetyStars: row.safetyStars,
    mileageKmpl: row.mileageKmpl === null ? null : Number(row.mileageKmpl),
    evRangeKm: row.evRangeKm,
    segment: row.segment,
    fuelType: row.fuelType,
    transmission: row.transmission,
    tags: row.tags,
    specs: row.specs,
    images: row.images.map(mapImage).sort((left, right) => left.sortOrder - right.sortOrder),
    reviews: row.reviews.map(mapReview),
  };
}

export async function listCars(filters: ListCarsFilters): Promise<PaginatedCars> {
  const conditions = [
    filters.search ? ilike(cars.name, `%${filters.search}%`) : undefined,
    filters.segment ? eq(cars.segment, filters.segment) : undefined,
    filters.fuelType ? eq(cars.fuelType, filters.fuelType) : undefined,
    filters.transmission ? eq(cars.transmission, filters.transmission) : undefined,
    filters.minPriceLakh !== undefined ? gte(cars.priceLakh, filters.minPriceLakh.toFixed(2)) : undefined,
    filters.maxPriceLakh !== undefined ? lte(cars.priceLakh, filters.maxPriceLakh.toFixed(2)) : undefined,
    filters.tags && filters.tags.length > 0 ? sql`${cars.tags} && ${filters.tags}` : undefined,
  ].filter(Boolean);

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (filters.page - 1) * filters.limit;

  const [rows, countRows] = await Promise.all([
    db.query.cars.findMany({
      where: whereClause,
      with: {
        images: true,
        reviews: true,
      },
      orderBy: [asc(cars.priceLakh), asc(cars.name)],
      limit: filters.limit,
      offset,
    }),
    db.select({ count: sql<number>`count(*)::int` }).from(cars).where(whereClause),
  ]);

  const total = countRows[0]?.count ?? 0;

  return {
    items: rows.map((row) => mapCarRecord(row)),
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.limit)),
  };
}

export async function getCarById(carId: number): Promise<CarRecord | null> {
  const row = await db.query.cars.findFirst({
    where: eq(cars.id, carId),
    with: {
      images: true,
      reviews: true,
    },
  });

  return row ? mapCarRecord(row) : null;
}

export type UpsertCarInput = {
  brand: string;
  evRangeKm: number | null;
  fuelType: Car["fuelType"];
  mileageKmpl: number | null;
  name: string;
  priceLakh: number;
  safetyStars: number;
  segment: Car["segment"];
  specs: Record<string, unknown>;
  tags: string[];
  transmission: Car["transmission"];
};

export async function createCar(input: UpsertCarInput): Promise<CarRecord> {
  const inserted = await db
    .insert(cars)
    .values({
      brand: input.brand,
      evRangeKm: input.evRangeKm,
      fuelType: input.fuelType,
      mileageKmpl: input.mileageKmpl === null ? null : input.mileageKmpl.toFixed(2),
      name: input.name,
      priceLakh: input.priceLakh.toFixed(2),
      safetyStars: input.safetyStars,
      segment: input.segment,
      specs: input.specs,
      tags: input.tags,
      transmission: input.transmission,
    })
    .returning({ id: cars.id });

  const created = await getCarById(inserted[0].id);

  if (!created) {
    throw new Error("Car was created but could not be reloaded.");
  }

  return created;
}

export async function updateCar(carId: number, input: Partial<UpsertCarInput>): Promise<CarRecord | null> {
  const updates: Partial<typeof cars.$inferInsert> = {};

  if (input.brand !== undefined) updates.brand = input.brand;
  if (input.evRangeKm !== undefined) updates.evRangeKm = input.evRangeKm;
  if (input.fuelType !== undefined) updates.fuelType = input.fuelType;
  if (input.mileageKmpl !== undefined) updates.mileageKmpl = input.mileageKmpl === null ? null : input.mileageKmpl.toFixed(2);
  if (input.name !== undefined) updates.name = input.name;
  if (input.priceLakh !== undefined) updates.priceLakh = input.priceLakh.toFixed(2);
  if (input.safetyStars !== undefined) updates.safetyStars = input.safetyStars;
  if (input.segment !== undefined) updates.segment = input.segment;
  if (input.specs !== undefined) updates.specs = input.specs;
  if (input.tags !== undefined) updates.tags = input.tags;
  if (input.transmission !== undefined) updates.transmission = input.transmission;
  updates.updatedAt = new Date();

  const updated = await db.update(cars).set(updates).where(eq(cars.id, carId)).returning({ id: cars.id });

  if (updated.length === 0) {
    return null;
  }

  return getCarById(carId);
}

export async function deleteCar(carId: number): Promise<boolean> {
  const deleted = await db.delete(cars).where(eq(cars.id, carId)).returning({ id: cars.id });
  return deleted.length > 0;
}

export async function getCarsByIds(carIds: number[]): Promise<CarRecord[]> {
  if (carIds.length === 0) {
    return [];
  }

  const rows = await db.query.cars.findMany({
    where: inArray(cars.id, carIds),
    with: {
      images: true,
      reviews: true,
    },
    orderBy: [desc(cars.safetyStars), asc(cars.priceLakh)],
  });

  return rows.map((row) => mapCarRecord(row));
}

export async function listAllCars(): Promise<CarRecord[]> {
  const rows = await db.query.cars.findMany({
    with: {
      images: true,
      reviews: true,
    },
    orderBy: [asc(cars.priceLakh), asc(cars.name)],
  });

  return rows.map((row) => mapCarRecord(row));
}
