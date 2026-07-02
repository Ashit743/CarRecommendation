import { sql } from "drizzle-orm";

import { db, sql as client } from "./client.js";
import { carImages, cars, reviews } from "./schema.js";

type SeedSegment = "hatchback" | "sedan" | "compact-suv" | "mid-suv" | "mpv" | "ev";
type SeedFuelType = "petrol" | "diesel" | "cng" | "hybrid" | "electric";
type SeedTransmission = "manual" | "automatic" | "amt" | "cvt" | "dct";

type SeedCar = {
  brand: string;
  name: string;
  priceLakh: string;
  safetyStars: number;
  mileageKmpl: string | null;
  evRangeKm: number | null;
  segment: SeedSegment;
  fuelType: SeedFuelType;
  transmission: SeedTransmission;
  tags: string[];
  specs: Record<string, unknown>;
};

const seedCars: SeedCar[] = [
  {
    brand: "Maruti Suzuki",
    name: "Swift ZXi",
    priceLakh: "8.45",
    safetyStars: 4,
    mileageKmpl: "24.80",
    evRangeKm: null,
    segment: "hatchback",
    fuelType: "petrol",
    transmission: "amt",
    tags: ["city", "value", "service-network"],
    specs: { airbags: 6, bootLitres: 265, touchscreenInches: 9, sunroof: false },
  },
  {
    brand: "Maruti Suzuki",
    name: "Baleno Alpha",
    priceLakh: "9.92",
    safetyStars: 4,
    mileageKmpl: "22.94",
    evRangeKm: null,
    segment: "hatchback",
    fuelType: "petrol",
    transmission: "amt",
    tags: ["premium", "city", "features"],
    specs: { airbags: 6, bootLitres: 318, headsUpDisplay: true, sunroof: false },
  },
  {
    brand: "Maruti Suzuki",
    name: "WagonR ZXi+",
    priceLakh: "7.32",
    safetyStars: 2,
    mileageKmpl: "24.35",
    evRangeKm: null,
    segment: "hatchback",
    fuelType: "petrol",
    transmission: "amt",
    tags: ["space", "city", "efficiency"],
    specs: { airbags: 4, bootLitres: 341, rearCamera: true, sunroof: false },
  },
  {
    brand: "Hyundai",
    name: "Grand i10 Nios Asta",
    priceLakh: "8.24",
    safetyStars: 3,
    mileageKmpl: "20.70",
    evRangeKm: null,
    segment: "hatchback",
    fuelType: "petrol",
    transmission: "amt",
    tags: ["city", "features", "refinement"],
    specs: { airbags: 6, bootLitres: 260, wirelessCharger: true, sunroof: false },
  },
  {
    brand: "Tata",
    name: "Tiago XZ+",
    priceLakh: "7.90",
    safetyStars: 4,
    mileageKmpl: "20.09",
    evRangeKm: null,
    segment: "hatchback",
    fuelType: "petrol",
    transmission: "manual",
    tags: ["safety", "value", "family"],
    specs: { airbags: 2, bootLitres: 242, rearWiper: true, sunroof: false },
  },
  {
    brand: "Tata",
    name: "Altroz XZ+",
    priceLakh: "10.12",
    safetyStars: 5,
    mileageKmpl: "19.33",
    evRangeKm: null,
    segment: "hatchback",
    fuelType: "petrol",
    transmission: "dct",
    tags: ["safety", "premium", "highway"],
    specs: { airbags: 6, bootLitres: 345, cruiseControl: true, sunroof: true },
  },
  {
    brand: "Toyota",
    name: "Glanza V",
    priceLakh: "9.99",
    safetyStars: 4,
    mileageKmpl: "22.94",
    evRangeKm: null,
    segment: "hatchback",
    fuelType: "petrol",
    transmission: "amt",
    tags: ["reliability", "city", "features"],
    specs: { airbags: 6, bootLitres: 318, headsUpDisplay: true, sunroof: false },
  },
  {
    brand: "Maruti Suzuki",
    name: "Dzire ZXi+",
    priceLakh: "9.69",
    safetyStars: 5,
    mileageKmpl: "24.79",
    evRangeKm: null,
    segment: "sedan",
    fuelType: "petrol",
    transmission: "amt",
    tags: ["chauffeur", "city", "efficiency"],
    specs: { airbags: 6, bootLitres: 382, rearAcVents: true, sunroof: false },
  },
  {
    brand: "Hyundai",
    name: "Aura SX",
    priceLakh: "8.95",
    safetyStars: 3,
    mileageKmpl: "20.50",
    evRangeKm: null,
    segment: "sedan",
    fuelType: "petrol",
    transmission: "amt",
    tags: ["value", "city", "comfort"],
    specs: { airbags: 6, bootLitres: 402, rearAcVents: true, wirelessCharger: true },
  },
  {
    brand: "Honda",
    name: "City VX",
    priceLakh: "14.88",
    safetyStars: 5,
    mileageKmpl: "17.80",
    evRangeKm: null,
    segment: "sedan",
    fuelType: "petrol",
    transmission: "cvt",
    tags: ["highway", "family", "premium"],
    specs: { airbags: 6, bootLitres: 506, adas: true, sunroof: true },
  },
  {
    brand: "Hyundai",
    name: "Verna SX(O)",
    priceLakh: "15.27",
    safetyStars: 5,
    mileageKmpl: "18.60",
    evRangeKm: null,
    segment: "sedan",
    fuelType: "petrol",
    transmission: "dct",
    tags: ["performance", "premium", "features"],
    specs: { airbags: 6, bootLitres: 528, adas: true, sunroof: true },
  },
  {
    brand: "Skoda",
    name: "Slavia Style",
    priceLakh: "16.39",
    safetyStars: 5,
    mileageKmpl: "18.73",
    evRangeKm: null,
    segment: "sedan",
    fuelType: "petrol",
    transmission: "automatic",
    tags: ["highway", "build-quality", "premium"],
    specs: { airbags: 6, bootLitres: 521, sunroof: true, ventilatedSeats: true },
  },
  {
    brand: "Volkswagen",
    name: "Virtus GT Plus",
    priceLakh: "18.12",
    safetyStars: 5,
    mileageKmpl: "18.67",
    evRangeKm: null,
    segment: "sedan",
    fuelType: "petrol",
    transmission: "dct",
    tags: ["enthusiast", "highway", "premium"],
    specs: { airbags: 6, bootLitres: 521, sunroof: true, digitalCluster: true },
  },
  {
    brand: "Maruti Suzuki",
    name: "Brezza ZXi+",
    priceLakh: "12.58",
    safetyStars: 4,
    mileageKmpl: "19.89",
    evRangeKm: null,
    segment: "compact-suv",
    fuelType: "petrol",
    transmission: "automatic",
    tags: ["family", "city", "service-network"],
    specs: { airbags: 6, bootLitres: 328, sunroof: true, rearCamera: true },
  },
  {
    brand: "Tata",
    name: "Nexon Fearless+",
    priceLakh: "14.30",
    safetyStars: 5,
    mileageKmpl: "17.44",
    evRangeKm: null,
    segment: "compact-suv",
    fuelType: "petrol",
    transmission: "dct",
    tags: ["safety", "features", "family"],
    specs: { airbags: 6, bootLitres: 382, sunroof: true, digitalCluster: true },
  },
  {
    brand: "Hyundai",
    name: "Venue SX(O)",
    priceLakh: "13.32",
    safetyStars: 4,
    mileageKmpl: "18.31",
    evRangeKm: null,
    segment: "compact-suv",
    fuelType: "petrol",
    transmission: "dct",
    tags: ["city", "features", "tech"],
    specs: { airbags: 6, bootLitres: 350, dashcam: true, sunroof: true },
  },
  {
    brand: "Kia",
    name: "Sonet HTX",
    priceLakh: "13.49",
    safetyStars: 3,
    mileageKmpl: "18.40",
    evRangeKm: null,
    segment: "compact-suv",
    fuelType: "petrol",
    transmission: "dct",
    tags: ["features", "city", "premium"],
    specs: { airbags: 6, bootLitres: 385, ventilatedSeats: true, sunroof: true },
  },
  {
    brand: "Mahindra",
    name: "XUV 3XO AX5",
    priceLakh: "12.49",
    safetyStars: 5,
    mileageKmpl: "18.89",
    evRangeKm: null,
    segment: "compact-suv",
    fuelType: "petrol",
    transmission: "automatic",
    tags: ["safety", "space", "value"],
    specs: { airbags: 6, bootLitres: 364, panoramicSunroof: true, adas: true },
  },
  {
    brand: "Renault",
    name: "Kiger RXZ",
    priceLakh: "10.99",
    safetyStars: 4,
    mileageKmpl: "20.50",
    evRangeKm: null,
    segment: "compact-suv",
    fuelType: "petrol",
    transmission: "cvt",
    tags: ["value", "city", "space"],
    specs: { airbags: 4, bootLitres: 405, cruiseControl: true, wirelessAndroidAuto: true },
  },
  {
    brand: "Nissan",
    name: "Magnite Tekna",
    priceLakh: "10.79",
    safetyStars: 4,
    mileageKmpl: "19.70",
    evRangeKm: null,
    segment: "compact-suv",
    fuelType: "petrol",
    transmission: "cvt",
    tags: ["value", "city", "features"],
    specs: { airbags: 6, bootLitres: 336, aroundViewMonitor: true, wirelessCharger: true },
  },
  {
    brand: "Hyundai",
    name: "Exter SX(O)",
    priceLakh: "9.86",
    safetyStars: 4,
    mileageKmpl: "19.40",
    evRangeKm: null,
    segment: "compact-suv",
    fuelType: "petrol",
    transmission: "amt",
    tags: ["city", "micro-suv", "features"],
    specs: { airbags: 6, bootLitres: 391, dashcam: true, sunroof: true },
  },
  {
    brand: "Hyundai",
    name: "Creta SX(O)",
    priceLakh: "18.84",
    safetyStars: 5,
    mileageKmpl: "17.40",
    evRangeKm: null,
    segment: "mid-suv",
    fuelType: "petrol",
    transmission: "cvt",
    tags: ["family", "features", "comfort"],
    specs: { airbags: 6, bootLitres: 433, panoramicSunroof: true, adas: true },
  },
  {
    brand: "Kia",
    name: "Seltos GTX+",
    priceLakh: "19.79",
    safetyStars: 5,
    mileageKmpl: "17.90",
    evRangeKm: null,
    segment: "mid-suv",
    fuelType: "petrol",
    transmission: "dct",
    tags: ["premium", "features", "family"],
    specs: { airbags: 6, bootLitres: 433, panoramicSunroof: true, adas: true },
  },
  {
    brand: "Mahindra",
    name: "Scorpio-N Z8",
    priceLakh: "21.15",
    safetyStars: 5,
    mileageKmpl: "15.42",
    evRangeKm: null,
    segment: "mid-suv",
    fuelType: "diesel",
    transmission: "automatic",
    tags: ["road-trip", "rugged", "7-seater"],
    specs: { airbags: 6, ladderFrame: true, bootLitres: 460, sunroof: true },
  },
  {
    brand: "Mahindra",
    name: "XUV700 AX7",
    priceLakh: "24.24",
    safetyStars: 5,
    mileageKmpl: "16.57",
    evRangeKm: null,
    segment: "mid-suv",
    fuelType: "petrol",
    transmission: "automatic",
    tags: ["adas", "family", "highway"],
    specs: { airbags: 7, panoramicSunroof: true, adas: true, bootLitres: 240 },
  },
  {
    brand: "Tata",
    name: "Harrier Fearless+",
    priceLakh: "25.10",
    safetyStars: 5,
    mileageKmpl: "16.80",
    evRangeKm: null,
    segment: "mid-suv",
    fuelType: "diesel",
    transmission: "automatic",
    tags: ["safety", "road-presence", "family"],
    specs: { airbags: 7, panoramicSunroof: true, adas: true, bootLitres: 445 },
  },
  {
    brand: "MG",
    name: "Hector Sharp Pro",
    priceLakh: "22.68",
    safetyStars: 5,
    mileageKmpl: "14.16",
    evRangeKm: null,
    segment: "mid-suv",
    fuelType: "petrol",
    transmission: "cvt",
    tags: ["space", "features", "family"],
    specs: { airbags: 6, panoramicSunroof: true, adas: true, screenInches: 14 },
  },
  {
    brand: "Toyota",
    name: "Urban Cruiser Hyryder V",
    priceLakh: "19.99",
    safetyStars: 4,
    mileageKmpl: "27.97",
    evRangeKm: null,
    segment: "mid-suv",
    fuelType: "hybrid",
    transmission: "cvt",
    tags: ["efficiency", "family", "reliability"],
    specs: { airbags: 6, panoramicSunroof: true, hybrid: true, bootLitres: 373 },
  },
  {
    brand: "Honda",
    name: "Elevate ZX",
    priceLakh: "16.73",
    safetyStars: 5,
    mileageKmpl: "16.92",
    evRangeKm: null,
    segment: "mid-suv",
    fuelType: "petrol",
    transmission: "cvt",
    tags: ["adas", "family", "comfort"],
    specs: { airbags: 6, adas: true, sunroof: true, bootLitres: 458 },
  },
  {
    brand: "Maruti Suzuki",
    name: "Ertiga ZXi+",
    priceLakh: "13.26",
    safetyStars: 3,
    mileageKmpl: "20.51",
    evRangeKm: null,
    segment: "mpv",
    fuelType: "petrol",
    transmission: "automatic",
    tags: ["7-seater", "family", "value"],
    specs: { airbags: 4, bootLitres: 209, captainSeats: false, rearAcVents: true },
  },
  {
    brand: "Toyota",
    name: "Rumion V",
    priceLakh: "13.75",
    safetyStars: 3,
    mileageKmpl: "20.11",
    evRangeKm: null,
    segment: "mpv",
    fuelType: "petrol",
    transmission: "automatic",
    tags: ["7-seater", "reliability", "family"],
    specs: { airbags: 4, bootLitres: 209, rearAcVents: true, connectedCar: true },
  },
  {
    brand: "Kia",
    name: "Carens Prestige Plus",
    priceLakh: "14.95",
    safetyStars: 3,
    mileageKmpl: "16.50",
    evRangeKm: null,
    segment: "mpv",
    fuelType: "petrol",
    transmission: "manual",
    tags: ["6-seater", "space", "family"],
    specs: { airbags: 6, bootLitres: 216, sunroof: true, rearAcVents: true },
  },
  {
    brand: "Toyota",
    name: "Innova Hycross ZX",
    priceLakh: "31.34",
    safetyStars: 5,
    mileageKmpl: "23.24",
    evRangeKm: null,
    segment: "mpv",
    fuelType: "hybrid",
    transmission: "cvt",
    tags: ["premium", "family", "chauffeur"],
    specs: { airbags: 6, ottomanSeats: true, adas: true, panoramicSunroof: true },
  },
  {
    brand: "Maruti Suzuki",
    name: "XL6 Alpha+",
    priceLakh: "14.61",
    safetyStars: 3,
    mileageKmpl: "20.27",
    evRangeKm: null,
    segment: "mpv",
    fuelType: "petrol",
    transmission: "automatic",
    tags: ["6-seater", "captain-seats", "family"],
    specs: { airbags: 4, captainSeats: true, cruiseControl: true, rearAcVents: true },
  },
  {
    brand: "Tata",
    name: "Tiago EV XZ Plus Long Range",
    priceLakh: "11.29",
    safetyStars: 4,
    mileageKmpl: null,
    evRangeKm: 315,
    segment: "ev",
    fuelType: "electric",
    transmission: "automatic",
    tags: ["city", "ev", "value"],
    specs: { airbags: 2, batteryKwh: 24, dcFastCharging: true, bootLitres: 240 },
  },
  {
    brand: "Tata",
    name: "Punch EV Empowered+",
    priceLakh: "14.29",
    safetyStars: 5,
    mileageKmpl: null,
    evRangeKm: 421,
    segment: "ev",
    fuelType: "electric",
    transmission: "automatic",
    tags: ["city", "ev", "safety"],
    specs: { airbags: 6, batteryKwh: 35, sunroof: true, frunkLitres: 14 },
  },
  {
    brand: "Tata",
    name: "Nexon EV Empowered+",
    priceLakh: "17.19",
    safetyStars: 5,
    mileageKmpl: null,
    evRangeKm: 465,
    segment: "ev",
    fuelType: "electric",
    transmission: "automatic",
    tags: ["family", "ev", "features"],
    specs: { airbags: 6, batteryKwh: 45, panoramicSunroof: true, v2l: true },
  },
  {
    brand: "MG",
    name: "Windsor EV Essence",
    priceLakh: "15.50",
    safetyStars: 5,
    mileageKmpl: null,
    evRangeKm: 331,
    segment: "ev",
    fuelType: "electric",
    transmission: "automatic",
    tags: ["space", "ev", "comfort"],
    specs: { airbags: 6, batteryKwh: 38, panoramicGlassRoof: true, recliningRearSeats: true },
  },
  {
    brand: "MG",
    name: "ZS EV Essence",
    priceLakh: "24.98",
    safetyStars: 5,
    mileageKmpl: null,
    evRangeKm: 461,
    segment: "ev",
    fuelType: "electric",
    transmission: "automatic",
    tags: ["premium", "ev", "highway"],
    specs: { airbags: 6, batteryKwh: 50, adas: true, panoramicSunroof: true },
  },
  {
    brand: "Mahindra",
    name: "XUV400 EL Pro",
    priceLakh: "17.49",
    safetyStars: 5,
    mileageKmpl: null,
    evRangeKm: 456,
    segment: "ev",
    fuelType: "electric",
    transmission: "automatic",
    tags: ["safety", "ev", "space"],
    specs: { airbags: 6, batteryKwh: 39.4, connectedCar: true, bootLitres: 378 },
  },
];

const reviewerNames = ["Aarav", "Diya", "Kabir", "Meera", "Rohan"];
const reviewTitles = [
  "Great everyday companion",
  "Balanced for family duties",
  "Strong value in its class",
  "Comfortable for mixed driving",
  "Good features for the price",
];
const reviewOpeners = [
  "After a few months of city and weekend use, this car feels easy to live with.",
  "For daily commutes plus occasional highway trips, it has been dependable.",
  "The overall package feels sensible for Indian road conditions and traffic.",
  "It delivers a nice blend of practicality and comfort for regular use.",
  "This variant stands out because it covers the basics without feeling stripped down.",
];
const reviewStrengths = [
  "The cabin usability is simple, visibility is good, and the feature list feels relevant.",
  "Ride comfort and drivability are the biggest strengths in stop-go traffic.",
  "It feels confidence inspiring on highways while still being manageable in the city.",
  "The combination of efficiency, space, and equipment makes it easy to recommend.",
  "Ownership costs and day-to-day practicality should work well for most buyers.",
];
const reviewTradeoffs = [
  "Road noise at higher speeds could be better controlled.",
  "The rear seat experience is fine, though not class-leading in every condition.",
  "Some interior materials feel built to a price.",
  "The suspension can feel a bit firm over sharper bumps.",
  "The infotainment system occasionally takes a moment to respond.",
];

function slugifyCar(brand: string, name: string) {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildImageUrls(brand: string, name: string) {
  const slug = slugifyCar(brand, name);

  return [
    {
      imageUrl: `https://images.example.com/indian-cars/${slug}/front-three-quarter.jpg`,
      altText: `${brand} ${name} front three quarter view`,
      sortOrder: 0,
    },
    {
      imageUrl: `https://images.example.com/indian-cars/${slug}/cabin-dashboard.jpg`,
      altText: `${brand} ${name} cabin dashboard view`,
      sortOrder: 1,
    },
    {
      imageUrl: `https://images.example.com/indian-cars/${slug}/rear-profile.jpg`,
      altText: `${brand} ${name} rear profile view`,
      sortOrder: 2,
    },
  ];
}

function buildReviews(car: SeedCar) {
  return reviewerNames.map((reviewerName, index) => ({
    reviewerName,
    rating: Math.max(3, Math.min(5, car.safetyStars - (index === 4 ? 1 : 0))),
    title: `${reviewTitles[index]}: ${car.brand} ${car.name}`,
    comment: `${reviewOpeners[index]} ${reviewStrengths[index]} ${reviewTradeoffs[index]}`,
    pros: [
      car.tags[0] ?? "value",
      car.tags[1] ?? "comfort",
      car.segment === "ev" ? "refinement" : "efficiency",
    ],
    cons: [
      index % 2 === 0 ? "road-noise" : "rear-seat-support",
      car.segment === "ev" ? "charging-network-dependence" : "waiting-period-variance",
    ],
  }));
}

async function seed() {
  await db.transaction(async (tx) => {
    await tx.delete(reviews);
    await tx.delete(carImages);
    await tx.delete(cars);

    const insertedCars = await tx
      .insert(cars)
      .values(seedCars)
      .returning({
        id: cars.id,
        brand: cars.brand,
        name: cars.name,
      });

    const imageRows = insertedCars.flatMap((car) => {
      return buildImageUrls(car.brand, car.name).map((image) => ({
        carId: car.id,
        imageUrl: image.imageUrl,
        altText: image.altText,
        sortOrder: image.sortOrder,
      }));
    });

    const reviewRows = insertedCars.flatMap((insertedCar) => {
      const sourceCar = seedCars.find((car) => car.brand === insertedCar.brand && car.name === insertedCar.name);

      if (!sourceCar) {
        return [];
      }

      return buildReviews(sourceCar).map((review) => ({
        carId: insertedCar.id,
        reviewerName: review.reviewerName,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        pros: review.pros,
        cons: review.cons,
      }));
    });

    await tx.insert(carImages).values(imageRows);
    await tx.insert(reviews).values(reviewRows);

    const [{ carCount }] = await tx
      .select({
        carCount: sql<number>`count(*)::int`,
      })
      .from(cars);

    const [{ imageCount }] = await tx
      .select({
        imageCount: sql<number>`count(*)::int`,
      })
      .from(carImages);

    const [{ reviewCount }] = await tx
      .select({
        reviewCount: sql<number>`count(*)::int`,
      })
      .from(reviews);

    console.log(`Seeded ${carCount} cars, ${imageCount} images, and ${reviewCount} reviews.`);
  });
}

seed()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error("Failed to seed database", error);
    await client.end({ timeout: 5 });
    process.exit(1);
  });
