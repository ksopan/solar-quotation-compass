
import { useEffect, useCallback } from "react";
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
import { useQuestionnaireFileHandlers } from "./useQuestionnaireFileHandlers";
import { useQuestionnaireFormHandlers } from "./useQuestionnaireFormHandlers";

export const useQuestionnaireProfileHandlers = () => {
  const {
    questionnaire,
    setFormData,
    setIsEditing,
    setIsLoadingFiles,
    isEditing,
    formData
  } = useQuestionnaireProfileState();

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

  // ✅ Handle Edit button
  const handleEdit = useCallback(() => {
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
    handleEdit, // <- expose the new handler
    isEditing   // <- expose the isEditing state for debugging
  };
};

export { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
