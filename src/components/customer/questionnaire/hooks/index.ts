
import { useCallback } from "react";
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
import { useQuestionnaireFileHandlers } from "./useQuestionnaireFileHandlers";
import { useQuestionnaireFormHandlers } from "./useQuestionnaireFormHandlers";

export const useQuestionnaireProfileHandlers = () => {
  // Get state from the state hook
  const {
    questionnaire,
    setFormData,
    setIsEditing,
    setIsLoadingFiles
  } = useQuestionnaireProfileState();

  // Get file and form handlers
  const fileHandlers = useQuestionnaireFileHandlers();
  const formHandlers = useQuestionnaireFormHandlers();

  // Handle edit function - defined here to ensure proper control flow
  const handleEdit = useCallback(() => {
    console.log("🔑 Main handleEdit called in useQuestionnaireProfileHandlers");
    if (questionnaire) {
      console.log("📋 Setting form data to questionnaire data:", questionnaire);
      setFormData(questionnaire);
      console.log("✏️ Setting isEditing to TRUE");
      setIsEditing(true);
    }
  }, [questionnaire, setFormData, setIsEditing]);

  return {
    ...fileHandlers,
    ...formHandlers,
    handleEdit, // Override the handleEdit from formHandlers
    loadFiles: fileHandlers.loadFiles,
    setIsLoadingFiles
  };
};

export { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
