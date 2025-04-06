
import { useEffect, useCallback } from "react";
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
import { useQuestionnaireFileHandlers } from "./useQuestionnaireFileHandlers";
import { useQuestionnaireFormHandlers } from "./useQuestionnaireFormHandlers";

export const useQuestionnaireProfileHandlers = () => {
  // Get state from the state hook
  const {
    questionnaire,
    setFormData,
    setIsEditing,
    setIsLoadingFiles,
    isEditing,
    formData
  } = useQuestionnaireProfileState();

  // Get file and form handlers
  const fileHandlers = useQuestionnaireFileHandlers();
  const formHandlers = useQuestionnaireFormHandlers();

  const { loadFiles } = fileHandlers;

  // 🔁 Load attachments when questionnaire changes
  useEffect(() => {
    if (questionnaire) {
      setIsLoadingFiles(true);
      loadFiles();
    }
  }, [questionnaire, loadFiles, setIsLoadingFiles]);

  // ✅ Create our own handleEdit function to ensure proper flow
  const handleEdit = useCallback(() => {
    console.log("🖊️ handleEdit called in useQuestionnaireProfileHandlers");
    if (questionnaire) {
      console.log("🖋️ Edit button clicked, setting form data and editing mode");
      setFormData(questionnaire);
      setIsEditing(true);
      console.log("🔍 Current editing state after setting:", isEditing);
      console.log("📋 Current form data after setting:", formData);
    }
  }, [questionnaire, setFormData, setIsEditing, isEditing, formData]);

  return {
    ...fileHandlers,
    ...formHandlers,
    handleEdit, // Expose our handleEdit function
    isEditing  // Expose the isEditing state for debugging
  };
};

export { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
