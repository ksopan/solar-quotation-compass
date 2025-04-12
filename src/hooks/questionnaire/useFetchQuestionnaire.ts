
import { useAuth } from "@/contexts/auth";
import { useQuestionnaireState } from "./fetch/useQuestionnaireState";
import { useQuestionnaireEffects } from "./fetch/useQuestionnaireEffects";

/**
 * Hook for fetching and managing questionnaire data
 * Combines state management and data fetching in a single hook
 */
export const useFetchQuestionnaire = () => {
  const { user } = useAuth();
  
  // Get state management
  const {
    questionnaire,
    setQuestionnaire,
    loading,
    setLoading,
    isSaving,
    setIsSaving
  } = useQuestionnaireState();
  
  // Set up effects for data fetching
  useQuestionnaireEffects({
    user,
    setQuestionnaire,
    setLoading
  });

  return {
    questionnaire,
    setQuestionnaire,
    loading,
    isSaving,
    setIsSaving
  };
};
