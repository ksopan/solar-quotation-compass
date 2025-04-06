
import { useQuestionnaireBase } from "./questionnaire/useQuestionnaireBase";
import { useFetchQuestionnaire } from "./questionnaire/useFetchQuestionnaire";
import { useQuestionnaireActions } from "./questionnaire/useQuestionnaireActions";
import { useQuestionnaireAttachments } from "./questionnaire/useQuestionnaireAttachments";
import { useMemo } from "react";

// Use export type for re-exporting types
export type { QuestionnaireData } from "./questionnaire/useQuestionnaireBase";

// Make this hook more stable and avoid any unnecessary re-renders
export const useQuestionnaire = () => {
  const { questionnaire, loading, isSaving, setQuestionnaire } = useQuestionnaireBase();
  const { fetchQuestionnaire } = useFetchQuestionnaire();
  const { updateQuestionnaire, createQuestionnaire } = useQuestionnaireActions();
  const { uploadAttachment, deleteAttachment, getFileUrl, isUploading } = useQuestionnaireAttachments();

  // Use useMemo to ensure stable references for all returned values
  return useMemo(() => ({
    questionnaire,
    loading,
    isSaving,
    updateQuestionnaire,
    createQuestionnaire,
    uploadAttachment,
    deleteAttachment,
    getFileUrl,
    fetchQuestionnaire,
    isUploading,
    setQuestionnaire // Expose this to allow direct state updates if needed
  }), [
    questionnaire,
    loading,
    isSaving,
    updateQuestionnaire,
    createQuestionnaire,
    uploadAttachment,
    deleteAttachment,
    getFileUrl,
    fetchQuestionnaire,
    isUploading,
    setQuestionnaire
  ]);
};
