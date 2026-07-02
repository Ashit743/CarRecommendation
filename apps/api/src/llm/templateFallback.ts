import type { QuestionnaireInput, RecommendationResult } from "@car-app/shared";

export function buildTemplateRecommendation(input: QuestionnaireInput): RecommendationResult {
  return {
    recommendations: [],
    summary: `LLM output was unavailable, so a deterministic fallback was returned for a budget of Rs ${input.budgetLakh.toFixed(2)} lakh.`,
  };
}
