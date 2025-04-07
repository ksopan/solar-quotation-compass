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
    isEditing
  } = useQuestionnaireProfileState();

  // Get file and form handlers
  const fileHandlers = useQuestionnaireFileHandlers();
  const formHandlers = useQuestionnaireFormHandlers();

  // Create a simplified handleEdit function
  const handleEdit = useCallback(() => {
    console.log("🔑 Main handleEdit called in useQuestionnaireProfileHandlers");
    
    if (questionnaire) {
      console.log("📋 Setting form data to questionnaire data:", questionnaire);
      // Create a new object with spread to ensure React detects the change
      setFormData({...questionnaire});
      console.log("✏️ Setting isEditing to TRUE");
      // Set editing state to true
      setIsEditing(true);
    } else {
      console.error("Cannot edit: questionnaire is null");
    }
  }, [questionnaire, setFormData, setIsEditing]);

  return {
    ...fileHandlers,
    ...formHandlers,
    // Override the handleEdit with our optimized version
    handleEdit
  };
};

export { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";