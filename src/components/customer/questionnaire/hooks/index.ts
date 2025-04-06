
import { useEffect } from "react";
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
import { useQuestionnaireFileHandlers } from "./useQuestionnaireFileHandlers";
import { useQuestionnaireFormHandlers } from "./useQuestionnaireFormHandlers";

export const useQuestionnaireProfileHandlers = () => {
  const fileHandlers = useQuestionnaireFileHandlers();
  const formHandlers = useQuestionnaireFormHandlers();

  const {
    questionnaire,
    setFormData,
    setIsEditing,
    setIsLoadingFiles
  } = useQuestionnaireProfileState();

  const { loadFiles } = fileHandlers;

  // 🔁 Load attachments when questionnaire changes
  useEffect(() => {
    if (questionnaire) {
      setIsLoadingFiles(true);
      loadFiles();
    }
  }, [questionnaire, loadFiles, setIsLoadingFiles]);

  // ✅ Add this: Handle Edit button
  const handleEdit = () => {
    if (questionnaire) {
      console.log("🖋️ Edit button clicked, setting form data and editing mode");
      setFormData(questionnaire);
      setIsEditing(true);
    }
  };

  return {
    ...fileHandlers,
    ...formHandlers,
    handleEdit // <- expose the new handler
  };
};

export { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
