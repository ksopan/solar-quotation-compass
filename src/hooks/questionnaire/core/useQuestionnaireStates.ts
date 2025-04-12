
import { useMemo } from "react";
import { useFetchQuestionnaire } from "../useFetchQuestionnaire";
import { useQuestionnaireActions } from "../useQuestionnaireActions";
import { useQuestionnaireAttachments } from "../useQuestionnaireAttachments";

/**
 * Hook that combines and provides all states from the questionnaire sub-hooks
 */
export const useQuestionnaireStates = () => {
  // Fetch questionnaire data and basic states
  const { 
    questionnaire, 
    loading, 
    isSaving, 
    setQuestionnaire 
  } = useFetchQuestionnaire();
  
  // Get questionnaire action methods
  const { 
    updateQuestionnaire, 
    createQuestionnaire 
  } = useQuestionnaireActions(questionnaire, setQuestionnaire);
  
  // Get attachment functionality
  const { 
    uploadAttachment, 
    deleteAttachment, 
    getFileUrl, 
    isUploading,
    attachments,
    isLoadingFiles
  } = useQuestionnaireAttachments(questionnaire);

  // Return all states in a memoized object to prevent unnecessary re-renders
  return useMemo(() => ({
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
