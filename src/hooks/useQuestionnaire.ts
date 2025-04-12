
import { useMemo } from "react";
import { useFetchQuestionnaire } from "./questionnaire/useFetchQuestionnaire";
import { useQuestionnaireActions } from "./questionnaire/useQuestionnaireActions";
import { useQuestionnaireAttachments } from "./questionnaire/useQuestionnaireAttachments";

// Use export type for re-exporting types
export type { QuestionnaireData } from "./questionnaire/useQuestionnaireBase";

/**
 * Main questionnaire hook that combines all questionnaire-related functionality
 * This is the primary hook that should be used by components
 */
export const useQuestionnaire = () => {
  const { 
    questionnaire, 
    loading, 
    isSaving, 
    setQuestionnaire 
  } = useFetchQuestionnaire();
  
  const { 
    updateQuestionnaire, 
    createQuestionnaire 
  } = useQuestionnaireActions(questionnaire, setQuestionnaire);
  
  const { 
    uploadAttachment, 
    deleteAttachment, 
    getFileUrl, 
    isUploading,
    attachments,
    isLoadingFiles
  } = useQuestionnaireAttachments(questionnaire);

  // Use useMemo to ensure stable references for all returned values
  return useMemo(() => ({
    // Questionnaire data and status
    questionnaire,
    loading,
    isSaving,
    isUploading,
    attachments,
    isLoadingFiles,
    
    // Actions
    updateQuestionnaire,
    createQuestionnaire,
    uploadAttachment,
    deleteAttachment,
    getFileUrl,
    
    // Allow direct state updates if needed
    setQuestionnaire
  }), [
    questionnaire,
    loading,
    isSaving,
    isUploading,
    attachments,
    isLoadingFiles,
    updateQuestionnaire,
    createQuestionnaire,
    uploadAttachment,
    deleteAttachment,
    getFileUrl,
    setQuestionnaire
  ]);
};
