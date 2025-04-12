
import { useState } from "react";
import { QuestionnaireData } from "../useQuestionnaireBase";

/**
 * Hook to manage questionnaire state
 * @returns State and state update functions for the questionnaire
 */
export const useQuestionnaireState = () => {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  return {
    questionnaire,
    setQuestionnaire,
    loading,
    setLoading,
    isSaving,
    setIsSaving
  };
};
