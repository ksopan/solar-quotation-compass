
import { useMemo } from "react";
import { useQuestionnaireStates } from "./useQuestionnaireStates";
import { QuestionnaireHookReturn } from "./types";

/**
 * Main questionnaire hook that combines all questionnaire-related functionality
 * This is the primary hook that should be used by components
 */
export const useQuestionnaire = (): QuestionnaireHookReturn => {
  // Get all states and actions from the states hook
  const states = useQuestionnaireStates();
  
  // Use useMemo to ensure stable references for all returned values
  return useMemo(() => ({
    // Questionnaire data and status
    questionnaire: states.questionnaire,
    loading: states.loading,
    isSaving: states.isSaving,
    isUploading: states.isUploading,
    attachments: states.attachments,
    isLoadingFiles: states.isLoadingFiles,
    
    // Actions
    updateQuestionnaire: states.updateQuestionnaire,
    createQuestionnaire: states.createQuestionnaire,
    uploadAttachment: states.uploadAttachment,
    deleteAttachment: states.deleteAttachment,
    getFileUrl: states.getFileUrl,
    
    // Allow direct state updates if needed
    setQuestionnaire: states.setQuestionnaire
  }), [states]);
};
