
import { useQuestionnaireBase, QuestionnaireData } from "./questionnaire/useQuestionnaireBase";
import { useFetchQuestionnaire } from "./questionnaire/useFetchQuestionnaire";
import { useQuestionnaireActions } from "./questionnaire/useQuestionnaireActions";
import { useQuestionnaireAttachments } from "./questionnaire/useQuestionnaireAttachments";

export { QuestionnaireData } from "./questionnaire/useQuestionnaireBase";

export const useQuestionnaire = () => {
  const { questionnaire, loading, isSaving } = useQuestionnaireBase();
  const { fetchQuestionnaire } = useFetchQuestionnaire();
  const { updateQuestionnaire, createQuestionnaire } = useQuestionnaireActions();
  const { uploadAttachment, getAttachments, deleteAttachment, getFileUrl } = useQuestionnaireAttachments();

  return {
    questionnaire,
    loading,
    isSaving,
    updateQuestionnaire,
    createQuestionnaire,
    uploadAttachment,
    getAttachments,
    deleteAttachment,
    getFileUrl,
    fetchQuestionnaire
  };
};
