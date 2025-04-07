
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
      
      // Set isEditing directly and then force a re-render with setTimeout
      setIsEditing(true);
      
      // This additional setTimeout ensures the UI updates correctly
      setTimeout(() => {
        console.log("✅ isEditing state check:", isEditing);
        // Force a state update by using this technique
        setIsEditing(prevState => {
          console.log("🔄 Inside state updater, current value:", prevState);
          return true; // Always ensure it's true
        });
        console.log("✅ isEditing double-checked with setTimeout");
      }, 50); // Slightly longer timeout to ensure the first state update has happened
    } else {
      console.error("Cannot edit: questionnaire is null");
    }
  }, [questionnaire, setFormData, setIsEditing, isEditing]);

  return {
    ...fileHandlers,
    ...formHandlers,
    handleEdit, // Override the handleEdit from formHandlers
    loadFiles: fileHandlers.loadFiles,
    setIsLoadingFiles
  };
};

export { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
