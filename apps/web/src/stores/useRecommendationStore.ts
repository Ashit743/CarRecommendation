import { defineStore } from "pinia";
import { reactive } from "vue";

import type { QuestionnaireInput } from "@car-app/shared";

const initialQuestionnaire = (): QuestionnaireInput => ({
  budgetLakh: 0,
  cityDrivingPercent: 70,
  highwayDrivingPercent: 30,
  familySize: 4,
  safetyPriority: 5,
  fuelPreference: "petrol",
  transmissionPreference: "automatic",
  preferredSegments: ["mid-suv"],
  featurePriorities: ["safety", "infotainment"],
});

export const useRecommendationStore = defineStore("recommendation", () => {
  const questionnaire = reactive<QuestionnaireInput>(initialQuestionnaire());

  function setBudget(value: number) {
    questionnaire.budgetLakh = value;
  }

  return {
    questionnaire,
    setBudget,
  };
});
