import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const segmentEnum = pgEnum("segment", [
  "hatchback",
  "sedan",
  "compact-suv",
  "mid-suv",
  "mpv",
  "ev",
]);
export const fuelTypeEnum = pgEnum("fuel_type", ["petrol", "diesel", "cng", "hybrid", "electric"]);
export const transmissionEnum = pgEnum("transmission", ["manual", "automatic", "amt", "cvt", "dct"]);

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  priceLakh: numeric("price_lakh", { precision: 10, scale: 2 }).notNull(),
  safetyStars: integer("safety_stars").notNull(),
  mileageKmpl: numeric("mileage_kmpl", { precision: 10, scale: 2 }),
  evRangeKm: integer("ev_range_km"),
  segment: segmentEnum("segment").notNull(),
  fuelType: fuelTypeEnum("fuel_type").notNull(),
  transmission: transmissionEnum("transmission").notNull(),
  tags: text("tags").array().notNull().default([]),
  specs: jsonb("specs").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const carImages = pgTable("car_images", {
  id: serial("id").primaryKey(),
  carId: integer("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  carId: integer("car_id")
    .notNull()
    .references(() => cars.id, { onDelete: "cascade" }),
  reviewerName: text("reviewer_name").notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  comment: text("comment").notNull(),
  pros: text("pros").array().notNull().default([]),
  cons: text("cons").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const carsRelations = relations(cars, ({ many }) => ({
  images: many(carImages),
  reviews: many(reviews),
}));

export const carImagesRelations = relations(carImages, ({ one }) => ({
  car: one(cars, {
    fields: [carImages.carId],
    references: [cars.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  car: one(cars, {
    fields: [reviews.carId],
    references: [cars.id],
  }),
}));
