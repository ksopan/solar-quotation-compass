
import { useQuestionnaireBase } from "./questionnaire/useQuestionnaireBase";
import { useFetchQuestionnaire } from "./questionnaire/useFetchQuestionnaire";
import { useQuestionnaireActions } from "./questionnaire/useQuestionnaireActions";
import { useQuestionnaireAttachments } from "./questionnaire/useQuestionnaireAttachments";

// Use export type for re-exporting types
export type { QuestionnaireData } from "./questionnaire/useQuestionnaireBase";

export const useQuestionnaire = () => {
  const { questionnaire, loading, isSaving } = useQuestionnaireBase();
  const { fetchQuestionnaire } = useFetchQuestionnaire();
  const { updateQuestionnaire, createQuestionnaire } = useQuestionnaireActions();
  const { uploadAttachment, deleteAttachment, getFileUrl, isUploading } = useQuestionnaireAttachments();

  return {
    questionnaire,
    loading,
    isSaving,
    updateQuestionnaire,
    createQuestionnaire,
    uploadAttachment,
    deleteAttachment,
    getFileUrl,
    fetchQuestionnaire,
    isUploading
  };
};
