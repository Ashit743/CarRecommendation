import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

import type { QuestionnaireInput, RecommendationItem, RecommendationResult } from "@car-app/shared";

const llmSummarySchema = z.object({
  summary: z.string().min(1),
  explanations: z.array(z.string().min(1)).min(1).max(5),
});

type BuildRecommendationNarrativeOptions = {
  apiKey?: string;
  input: QuestionnaireInput;
  model: string;
  recommendations: RecommendationItem[];
};

function generateFallbackExplanation(input: QuestionnaireInput, item: RecommendationItem): string {
  const car = item.car;
  const prefFuel = input.fuelPreference;
  const actualFuel = car.fuelType;
  const budget = input.budgetLakh;

  let fuelReason = "";
  if (prefFuel !== actualFuel) {
    if (prefFuel === "electric" && actualFuel !== "electric") {
      fuelReason = ` Although you preferred an electric vehicle, a ${actualFuel} model was chosen to fit your ₹${budget}L budget, as electric alternatives in your preferred segment are priced higher.`;
    } else if (prefFuel === "hybrid" && actualFuel !== "hybrid") {
      fuelReason = ` While you preferred a hybrid, this ${actualFuel} option was selected to match your ₹${budget}L budget since hybrid models in the ${car.segment} segment exceed this limit.`;
    } else {
      fuelReason = ` We recommended this ${actualFuel} model over ${prefFuel} to optimize for budget fit and value within your ₹${budget}L limit.`;
    }
  }

  const mileageText = car.mileageKmpl
    ? `, offering a strong city/highway mileage of ${car.mileageKmpl} kmpl`
    : car.evRangeKm
      ? `, offering an EV range of ${car.evRangeKm} km`
      : "";

  return `${car.brand} ${car.name} scores ${item.score.total}/100. It is a great fit for your ${car.segment} segment preference${mileageText}.${fuelReason}`;
}

function buildTemplateSummary(input: QuestionnaireInput, recommendations: RecommendationItem[]): RecommendationResult {
  const summaryLead = recommendations.length > 0
    ? `${recommendations[0].car.brand} ${recommendations[0].car.name} leads the shortlist for a budget of Rs ${input.budgetLakh.toFixed(2)} lakh.`
    : `No strong recommendation could be built for a budget of Rs ${input.budgetLakh.toFixed(2)} lakh.`;

  return {
    recommendations: recommendations.map((item) => ({
      ...item,
      explanation: generateFallbackExplanation(input, item),
    })),
    summary: `${summaryLead} This fallback summary is deterministic because Gemini was unavailable or returned invalid output.`,
  };
}

function buildPrompt(input: QuestionnaireInput, recommendations: RecommendationItem[]) {
  return [
    "You are an expert Indian car recommendation system. Analyse the user's input preferences and the recommended cars list.",
    "Provide a natural-language summary of the recommendations, and a detailed explanation for each recommended car.",
    "Return a JSON object with keys 'summary' (a general overview text) and 'explanations' (an array of strings matching the index of recommendations). Do not include any markdown formatting or code fences.",
    "",
    "CRITICAL REQUIREMENT for explanations:",
    `- If the recommended car's fuel type does not match the user's preferred fuel preference (e.g. user preferred electric or hybrid, but the car is petrol or diesel), you MUST address this mismatch in the explanation. Explain why the petrol/diesel car was chosen (e.g., because electric/hybrid options exceed their ₹${input.budgetLakh} Lakh budget, or because petrol/diesel offers outstanding mileage/value for city driving).`,
    "- Keep the explanations friendly, educational, and professional.",
    "",
    "Input data:",
    JSON.stringify({
      input,
      recommendations: recommendations.map((item) => ({
        car: {
          brand: item.car.brand,
          name: item.car.name,
          priceLakh: item.car.priceLakh,
          fuelType: item.car.fuelType,
          transmission: item.car.transmission,
          segment: item.car.segment,
          safetyStars: item.car.safetyStars,
          mileageKmpl: item.car.mileageKmpl,
          evRangeKm: item.car.evRangeKm,
          tags: item.car.tags,
        },
        score: item.score,
      })),
    }),
  ].join("\n");
}

export async function buildRecommendationNarrative(
  options: BuildRecommendationNarrativeOptions,
): Promise<RecommendationResult> {
  if (!options.apiKey || options.recommendations.length === 0) {
    return buildTemplateSummary(options.input, options.recommendations);
  }

  try {
    const client = new GoogleGenerativeAI(options.apiKey);
    const model = client.getGenerativeModel({
      model: options.model,
      generationConfig: { responseMimeType: "application/json" },
    });
    const response = await model.generateContent(buildPrompt(options.input, options.recommendations));
    let text = response.response.text().trim();

    if (text.startsWith("```")) {
      const match = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
      if (match && match[1]) {
        text = match[1].trim();
      }
    }

    const parsed = llmSummarySchema.parse(JSON.parse(text));

    return {
      summary: parsed.summary,
      recommendations: options.recommendations.map((item, index) => ({
        ...item,
        explanation: parsed.explanations[index] ?? item.explanation,
      })),
    };
  } catch {
    return buildTemplateSummary(options.input, options.recommendations);
  }
}
