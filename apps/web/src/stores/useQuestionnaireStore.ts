import { defineStore } from "pinia";
import { reactive, ref } from "vue";

import type { QuestionnaireInput, RecommendationResult } from "@car-app/shared";
import { getRecommendations } from "../api.js";

// ─── Defaults ────────────────────────────────────────────────────────────────

function defaultQuestionnaire(): QuestionnaireInput {
  return {
    budgetLakh: 12,
    cityDrivingPercent: 70,
    highwayDrivingPercent: 30,
    familySize: 4,
    safetyPriority: 4,
    fuelPreference: "petrol",
    transmissionPreference: "automatic",
    preferredSegments: ["compact-suv"],
    featurePriorities: ["safety", "infotainment"],
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useQuestionnaireStore = defineStore("questionnaire", () => {
  const step = ref(0);
  const totalSteps = 5;
  const questionnaire = reactive<QuestionnaireInput>(defaultQuestionnaire());
  const result = ref<RecommendationResult | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ─── Step navigation ──────────────────────────────────────────────────────

  function nextStep() {
    if (step.value < totalSteps - 1) step.value++;
  }

  function prevStep() {
    if (step.value > 0) step.value--;
  }

  function goToStep(index: number) {
    if (index >= 0 && index < totalSteps) step.value = index;
  }

  function reset() {
    step.value = 0;
    result.value = null;
    error.value = null;
    Object.assign(questionnaire, defaultQuestionnaire());
  }

  // ─── Field setters (used from @input handlers — never inline ifs) ─────────

  function setBudget(value: number) {
    questionnaire.budgetLakh = value;
  }

  function setFamilySize(value: number) {
    questionnaire.familySize = value;
  }

  function setCityDriving(value: number) {
    questionnaire.cityDrivingPercent = value;
    questionnaire.highwayDrivingPercent = 100 - value;
  }

  function setSafetyPriority(value: number) {
    questionnaire.safetyPriority = value;
  }

  function setFuelPreference(value: QuestionnaireInput["fuelPreference"]) {
    questionnaire.fuelPreference = value;
  }

  function setTransmissionPreference(value: QuestionnaireInput["transmissionPreference"]) {
    questionnaire.transmissionPreference = value;
  }

  function toggleSegment(segment: QuestionnaireInput["preferredSegments"][number]) {
    const idx = questionnaire.preferredSegments.indexOf(segment);
    if (idx === -1) {
      questionnaire.preferredSegments.push(segment);
    } else if (questionnaire.preferredSegments.length > 1) {
      questionnaire.preferredSegments.splice(idx, 1);
    }
  }

  function toggleFeature(feature: string) {
    const idx = questionnaire.featurePriorities.indexOf(feature);
    if (idx === -1) {
      questionnaire.featurePriorities.push(feature);
    } else if (questionnaire.featurePriorities.length > 1) {
      questionnaire.featurePriorities.splice(idx, 1);
    }
  }

  // ─── Submission ───────────────────────────────────────────────────────────

  async function submit() {
    loading.value = true;
    error.value = null;
    try {
      result.value = await getRecommendations({ ...questionnaire });
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : "Something went wrong.";
    } finally {
      loading.value = false;
    }
  }

  return {
    step,
    totalSteps,
    questionnaire,
    result,
    loading,
    error,
    nextStep,
    prevStep,
    goToStep,
    reset,
    setBudget,
    setFamilySize,
    setCityDriving,
    setSafetyPriority,
    setFuelPreference,
    setTransmissionPreference,
    toggleSegment,
    toggleFeature,
    submit,
  };
});
