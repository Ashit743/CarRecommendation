import { eq } from "drizzle-orm";
import { db } from "./client.js";
import { carImages } from "./schema.js";

const CAR_MAPPINGS: Record<number, { brand: string; model: string }> = {
  1: { brand: "maruti", model: "swift" },
  2: { brand: "maruti", model: "baleno" },
  3: { brand: "maruti", model: "wagon-r" },
  4: { brand: "hyundai", model: "grand-i10-nios" },
  5: { brand: "tata", model: "tiago" },
  6: { brand: "tata", model: "altroz" },
  7: { brand: "toyota", model: "glanza" },
  8: { brand: "maruti", model: "dzire" },
  9: { brand: "hyundai", model: "aura" },
  10: { brand: "honda", model: "city" },
  11: { brand: "hyundai", model: "verna" },
  12: { brand: "skoda", model: "slavia" },
  13: { brand: "volkswagen", model: "virtus" },
  14: { brand: "maruti", model: "brezza" },
  15: { brand: "tata", model: "nexon" },
  16: { brand: "hyundai", model: "venue" },
  17: { brand: "kia", model: "sonet" },
  18: { brand: "mahindra", model: "xuv-3xo" },
  19: { brand: "renault", model: "kiger" },
  20: { brand: "nissan", model: "magnite" },
  21: { brand: "hyundai", model: "exter" },
  22: { brand: "hyundai", model: "creta" },
  23: { brand: "kia", model: "seltos" },
  24: { brand: "mahindra", model: "scorpio-n" },
  25: { brand: "mahindra", model: "xuv700" },
  26: { brand: "tata", model: "harrier" },
  27: { brand: "mg-cars", model: "hector" },
  28: { brand: "toyota", model: "urban-cruiser-hyryder" },
  29: { brand: "honda", model: "elevate" },
  30: { brand: "maruti", model: "ertiga" },
  31: { brand: "toyota", model: "rumion" },
  32: { brand: "kia", model: "carens" },
  33: { brand: "toyota", model: "innova-hycross" },
  34: { brand: "maruti", model: "xl6" },
  35: { brand: "tata", model: "tiago-ev" },
  36: { brand: "tata", model: "punch-ev" },
  37: { brand: "tata", model: "nexon-ev" },
  38: { brand: "mg-cars", model: "mg-windsor-ev" },
  39: { brand: "mg-cars", model: "mg-zs-ev" },
  40: { brand: "mahindra", model: "xuv400-ev" }
};

interface ImageObject {
  "@type": string;
  position: string;
  name: string;
  caption: string;
  contentUrl: string;
}

interface ImageGalleryJsonLd {
  "@type": string;
  mainEntity?: {
    "@type": string;
    itemListElement?: ImageObject[];
  };
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtmlWithUserAgent(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.text();
}

async function getCarDekhoImages(brand: string, model: string): Promise<{ imageUrl: string; altText: string; sortOrder: number }[]> {
  // URLs to try in order
  const urls = [
    `https://www.cardekho.com/${brand}/${model}/pictures`,
    `https://www.cardekho.com/${brand}-${model}/pictures.htm`
  ];

  let html = "";
  let successUrl = "";

  for (const url of urls) {
    try {
      html = await fetchHtmlWithUserAgent(url);
      successUrl = url;
      break;
    } catch {
      // Continue to next URL pattern
    }
  }

  if (!html) {
    throw new Error(`Failed to load page for brand: ${brand}, model: ${model}`);
  }

  // Regex to extract JSON-LD script tags
  const scriptRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match;
  let galleryData: ImageGalleryJsonLd | null = null;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      if (data["@type"] === "ImageGallery") {
        galleryData = data;
        break;
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  if (!galleryData || !galleryData.mainEntity?.itemListElement) {
    throw new Error(`No ImageGallery JSON-LD schema found on page ${successUrl}`);
  }

  const items = galleryData.mainEntity.itemListElement;
  if (items.length === 0) {
    return [];
  }

  // We want to extract front, side, and rear views.
  const frontKeywords = ["front left", "front profile", "front right", "front view", "front-left-side-47"];
  const rearKeywords = ["rear", "back", "rear profile", "rear-view", "rear left", "rear right"];
  const sideKeywords = ["side profile", "side view", "side profile (left)", "side profile (right)", "front-right-view"];

  let frontImg: ImageObject | null = null;
  let rearImg: ImageObject | null = null;
  let sideImg: ImageObject | null = null;

  for (const item of items) {
    const caption = (item.caption || item.name || "").toLowerCase();
    const url = (item.contentUrl || "").toLowerCase();

    // Check front
    if (!frontImg && frontKeywords.some(kw => caption.includes(kw) || url.includes(kw))) {
      frontImg = item;
    }
    // Check rear
    if (!rearImg && rearKeywords.some(kw => caption.includes(kw) || url.includes(kw))) {
      rearImg = item;
    }
    // Check side
    if (!sideImg && sideKeywords.some(kw => caption.includes(kw) || url.includes(kw))) {
      sideImg = item;
    }
  }

  // Fallbacks: if we are missing any specific view, we pick from the start of the list
  const selected: ImageObject[] = [];

  if (frontImg) selected.push(frontImg);
  else if (items[0]) selected.push(items[0]);

  if (sideImg) selected.push(sideImg);
  else if (items[2]) selected.push(items[2]);
  else if (items[1] && items[1] !== frontImg) selected.push(items[1]);

  if (rearImg) selected.push(rearImg);
  else if (items[1] && items[1] !== frontImg && items[1] !== sideImg) selected.push(items[1]);
  else if (items[3]) selected.push(items[3]);

  // Map to the required table layout
  return selected.map((item, index) => ({
    imageUrl: item.contentUrl,
    altText: item.caption || item.name || `${brand} ${model} view`,
    sortOrder: index
  }));
}

async function main() {
  const allCars = await db.query.cars.findMany();
  console.log(`Starting to fetch CarDekho images for ${allCars.length} cars...`);

  for (const car of allCars) {
    const mapping = CAR_MAPPINGS[car.id];
    if (!mapping) {
      console.log(`[Car ID ${car.id}] No slug mapping defined. Skipping.`);
      continue;
    }

    console.log(`[Car ID ${car.id}] Fetching images for ${car.brand} ${car.name}...`);
    try {
      const imagesList = await getCarDekhoImages(mapping.brand, mapping.model);
      
      // Delete existing images for this car
      await db.delete(carImages).where(eq(carImages.carId, car.id));

      if (imagesList.length > 0) {
        // Insert new ones
        await db.insert(carImages).values(
          imagesList.map((img) => ({
            carId: car.id,
            imageUrl: img.imageUrl,
            altText: img.altText,
            sortOrder: img.sortOrder
          }))
        );
        console.log(`[Car ID ${car.id}] Successfully seeded ${imagesList.length} images.`);
      } else {
        console.log(`[Car ID ${car.id}] No images found on page.`);
      }

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[Car ID ${car.id}] Error: ${errMsg}. Cleaning existing image records to fallback.`);
      // If the get fails, it should be made as a fallback value (empty images in database to trigger frontend text fallback)
      await db.delete(carImages).where(eq(carImages.carId, car.id));
    }

    // Delay to respect rate-limiting
    await sleep(500);
  }

  console.log("Image update completed successfully!");
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
