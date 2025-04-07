
import { useCallback, useEffect } from "react";
import { useQuestionnaireFileHandlers } from "./useQuestionnaireFileHandlers";
import { useQuestionnaireFormHandlers } from "./useQuestionnaireFormHandlers";
import { useQuestionnaire } from "@/hooks/useQuestionnaire";
import useQuestionnaireStore from "./useQuestionnaireStore";

export const useQuestionnaireProfileHandlers = () => {
  // Get the questionnaire data from the API hook
  const {
    questionnaire,
    isSaving,
    isUploading,
    getFileUrl
  } = useQuestionnaire();
  
  // Get state from the Zustand store
  const {
    setFormData,
    setIsEditing,
    setQuestionnaire,
    setIsSaving,
    setIsLoadingFiles,
    isEditing
  } = useQuestionnaireStore();
  
  // Update store when questionnaire changes
  useEffect(() => {
    if (questionnaire) {
      setQuestionnaire(questionnaire);
    }
  }, [questionnaire, setQuestionnaire]);
  
  // Sync isSaving with store
  useEffect(() => {
    setIsSaving(isSaving);
  }, [isSaving, setIsSaving]);
  
  // For debugging
  useEffect(() => {
    console.log("🔍 Current editing state in handlers:", isEditing);
  }, [isEditing]);

  // Get file and form handlers
  const fileHandlers = useQuestionnaireFileHandlers();
  const formHandlers = useQuestionnaireFormHandlers();

  // Handle edit function - defined here to ensure proper control flow
  const handleEdit = useCallback(() => {
    console.log("🔑 Main handleEdit called in useQuestionnaireProfileHandlers");
    if (questionnaire) {
      console.log("📋 Setting form data to questionnaire data:", questionnaire);
      // Create a new object to ensure React detects the change
      const newFormData = {...questionnaire};
      
      // First update the form data, then set editing mode
      setFormData(newFormData);
      console.log("✏️ Setting isEditing to TRUE");
      
      // Set editing mode immediately
      setIsEditing(true);
      console.log("✅ isEditing set to TRUE immediately");
      
      // Also set it again with a small delay to ensure UI updates
      // This is a workaround for potential race conditions in React's state updates
      setTimeout(() => {
        setIsEditing(true);
        console.log("✅ isEditing set to TRUE with timeout");
      }, 50);
    } else {
      console.error("Cannot edit: questionnaire is null");
    }
  }, [questionnaire, setFormData, setIsEditing]);

  return {
    ...fileHandlers,
    ...formHandlers,
    handleEdit, // Override the handleEdit from formHandlers
    loadFiles: fileHandlers.loadFiles,
    setIsLoadingFiles,
    isUploading,
    getFileUrl
  };
};

export { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
export { default as useQuestionnaireStore } from "./useQuestionnaireStore";
