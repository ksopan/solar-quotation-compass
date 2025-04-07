
import { useCallback, useEffect } from "react";
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
    isEditing
  } = useQuestionnaireProfileState();

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
      setFormData(newFormData);
      console.log("✏️ Setting isEditing to TRUE");
      
      // Set isEditing directly with a function to ensure latest state
      setIsEditing(() => true);
      
      // Force a refresh at the component level
      setTimeout(() => {
        // Force the state update using a functional update
        setIsEditing(current => {
          console.log("🔁 Force updating isEditing, current value:", current);
          return true;
        });
      }, 10);
    } else {
      console.error("Cannot edit: questionnaire is null");
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
