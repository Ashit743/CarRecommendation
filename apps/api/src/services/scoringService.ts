import type { QuestionnaireInput, RecommendationItem, ScoreBreakdown } from "@car-app/shared";

import type { CarRecord } from "./catalogService.js";

const SCORE_WEIGHTS = {
  budgetFit: 35,
  useCaseMatch: 25,
  featureMatch: 20,
  safety: 12,
  efficiency: 8,
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number) {
  return Number(value.toFixed(2));
}

// ─── Budget Fit ───────────────────────────────────────────────────────────────
// Scores based on price deviation. Cars more than 20% over budget score 0.

function calculateBudgetFit(input: QuestionnaireInput, car: CarRecord) {
  const price = car.priceLakh;
  const budget = input.budgetLakh;

  if (price <= budget) {
    // Reward savings up to 15% of the budget fit score
    const savingsRatio = (budget - price) / budget;
    return roundScore(SCORE_WEIGHTS.budgetFit * (0.85 + savingsRatio * 0.15));
  }

  const overBudgetRatio = (price - budget) / budget;
  if (overBudgetRatio > 0.20) {
    return 0; // Exceeds budget by more than 20%
  }

  // Linear drop to 0 at 20% over budget, starting from 70% of max budget score
  const scoreFraction = 1 - (overBudgetRatio / 0.20);
  return roundScore(SCORE_WEIGHTS.budgetFit * 0.70 * scoreFraction);
}

// ─── Fuel Match ───────────────────────────────────────────────────────────────
// Returns a [0, 1] ratio representing how closely the car's fuel type
// matches the user's stated fuel preference. Blended into useCaseMatch.

function calculateFuelMatch(input: QuestionnaireInput, car: CarRecord): number {
  if (car.fuelType === input.fuelPreference) return 1.0;

  const userWantsElectric = input.fuelPreference === "electric";
  const carIsElectric = car.fuelType === "electric";

  if (userWantsElectric && !carIsElectric) return 0.1;
  if (!userWantsElectric && carIsElectric) return 0.15;

  // Both are ICE variants — grade by similarity
  if (car.fuelType === "hybrid") {
    return input.fuelPreference === "petrol" || input.fuelPreference === "diesel" ? 0.6 : 0.35;
  }

  if (input.fuelPreference === "hybrid") {
    return car.fuelType === "petrol" ? 0.5 : 0.35;
  }

  // CNG vs petrol/diesel cross-match
  if (
    (input.fuelPreference === "cng" && (car.fuelType === "petrol" || car.fuelType === "diesel")) ||
    ((input.fuelPreference === "petrol" || input.fuelPreference === "diesel") && car.fuelType === "cng")
  ) {
    return 0.45;
  }

  return 0.35;
}

// ─── Transmission Match ────────────────────────────────────────────────────────
// NEW: Evaluates transmission preference safely, handling automatic subtypes
// (CVT, DCT, AMT) and cross-transmission (manual vs automatic) mismatches.

function calculateTransmissionFit(input: QuestionnaireInput, car: CarRecord): number {
  const preferred = input.transmissionPreference;
  const actual = car.transmission;

  if (preferred === actual) return 1.0;

  const isPreferredAuto = ["automatic", "amt", "cvt", "dct"].includes(preferred);
  const isCarAuto = ["automatic", "amt", "cvt", "dct"].includes(actual);

  if (isPreferredAuto && isCarAuto) {
    if (preferred === "automatic") {
      if (actual === "dct" || actual === "cvt") return 0.95;
      if (actual === "amt") return 0.85;
      return 0.90;
    }
    return 0.70; // Specific automatic type mismatch (e.g. AMT when CVT requested)
  }

  return 0.10; // Cross-transmission mismatch (manual vs auto)
}

// ─── Use Case Match ───────────────────────────────────────────────────────────
// Sub-weights redistributed to add fuelMatch (24%) and dynamic segment preference (28%).

function calculateUseCaseMatch(input: QuestionnaireInput, car: CarRecord) {
  const familyNeed = input.familySize >= 5 ? 1 : input.familySize >= 4 ? 0.85 : 0.65;

  // Dynamic: 1.0 if segment is in user's preferred list, 0.55 otherwise.
  const segmentFit = input.preferredSegments.includes(car.segment) ? 1.0 : 0.55;

  const cityBias = input.cityDrivingPercent / 100;
  const highwayBias = input.highwayDrivingPercent / 100;

  const cityFit =
    car.segment === "hatchback" || car.segment === "compact-suv" || car.segment === "ev" ? 1 : 0.72;
  const highwayFit =
    car.segment === "sedan" || car.segment === "mid-suv" || car.segment === "mpv" ? 1 : 0.7;

  const transmissionFit = calculateTransmissionFit(input, car);
  const fuelMatch = calculateFuelMatch(input, car);

  const blended =
    familyNeed * segmentFit * 0.28 +
    cityBias * cityFit * 0.14 +
    highwayBias * highwayFit * 0.14 +
    transmissionFit * 0.20 +
    fuelMatch * 0.24;

  return roundScore(SCORE_WEIGHTS.useCaseMatch * clamp(blended, 0, 1));
}

// ─── Feature Match ────────────────────────────────────────────────────────────
// NEW: Checks semantic match of feature priorities against actual spec values.

function matchFeature(priority: string, car: CarRecord): boolean {
  const p = priority.toLowerCase();
  const specs = car.specs as Record<string, unknown>;

  switch (p) {
    case "safety":
      return car.safetyStars >= 4 || car.tags.some((t) => t.toLowerCase() === "safety");
    case "infotainment":
      return !!(
        specs.touchscreenInches ||
        specs.screenInches ||
        specs.digitalCluster ||
        specs.wirelessAndroidAuto ||
        specs.headsUpDisplay
      );
    case "sunroof":
      // Value must be true (not just key presence)
      return !!(specs.sunroof || specs.panoramicSunroof || specs.panoramicGlassRoof);
    case "adas":
      return !!specs.adas;
    case "ventilated seats":
      return !!specs.ventilatedSeats;
    case "wireless charger":
      return !!specs.wirelessCharger;
    case "heads-up display":
      return !!specs.headsUpDisplay;
    case "cruise control":
      return !!specs.cruiseControl;
    case "rear ac vents":
      return !!specs.rearAcVents;
    case "boot space":
      return typeof specs.bootLitres === "number" && specs.bootLitres >= 350;
    default:
      return car.tags.some((t) => t.toLowerCase() === p);
  }
}

function calculateFeatureMatch(input: QuestionnaireInput, car: CarRecord) {
  if (input.featurePriorities.length === 0) return 0;

  const matches = input.featurePriorities.filter((priority) => matchFeature(priority, car)).length;
  const ratio = matches / input.featurePriorities.length;

  return roundScore(SCORE_WEIGHTS.featureMatch * clamp(ratio, 0, 1));
}

// ─── Safety ───────────────────────────────────────────────────────────────────
// Unchanged.

function calculateSafety(input: QuestionnaireInput, car: CarRecord) {
  const base = car.safetyStars / 5;
  const priorityBoost = 0.75 + input.safetyPriority / 10;

  return roundScore(SCORE_WEIGHTS.safety * clamp(base * priorityBoost, 0, 1));
}

// ─── Efficiency ───────────────────────────────────────────────────────────────
// Boosted (1.1x) if the car matches user fuelPreference.

function calculateEfficiency(input: QuestionnaireInput, car: CarRecord) {
  const efficiencyBase =
    car.fuelType === "electric"
      ? clamp((car.evRangeKm ?? 0) / 500, 0, 1)
      : clamp((car.mileageKmpl ?? 0) / 30, 0, 1);

  const fuelMatchBoost = car.fuelType === input.fuelPreference ? 1.1 : 1.0;

  return roundScore(SCORE_WEIGHTS.efficiency * clamp(efficiencyBase * fuelMatchBoost, 0, 1));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function scoreCar(input: QuestionnaireInput, car: CarRecord): ScoreBreakdown {
  const budgetFit = calculateBudgetFit(input, car);
  const useCaseMatch = calculateUseCaseMatch(input, car);
  const featureMatch = calculateFeatureMatch(input, car);
  const safety = calculateSafety(input, car);
  const efficiency = calculateEfficiency(input, car);
  const total = roundScore(budgetFit + useCaseMatch + featureMatch + safety + efficiency);

  return {
    budgetFit,
    useCaseMatch,
    featureMatch,
    safety,
    efficiency,
    total,
  };
}

export function rankRecommendations(input: QuestionnaireInput, cars: CarRecord[]): RecommendationItem[] {
  return cars
    .map((car) => {
      const score = scoreCar(input, car);

      return {
        car,
        score,
        explanation: `${car.brand} ${car.name} scores ${score.total}/100 with strong budget fit, use-case alignment, and safety for the stated priorities.`,
      };
    })
    .sort((left, right) => right.score.total - left.score.total)
    .slice(0, 5);
}
