
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
    isEditing,
    user,
    supabase
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

  // Add getFileUrl if it's not provided by fileHandlers
  const getFileUrl = useCallback((fileName: string) => {
    if (!user) return null;

    try {
      const { data } = supabase.storage
        .from('questionnaire_attachments')
        .getPublicUrl(`${user.id}/${fileName}`);
      return data.publicUrl;
    } catch (error) {
      console.error("Error in getFileUrl:", error);
      return null;
    }
  }, [user, supabase]);

  return {
    ...fileHandlers,
    ...formHandlers,
    // Override the handleEdit with our optimized version
    handleEdit,
    // Ensure getFileUrl is included
    getFileUrl: fileHandlers.getFileUrl || getFileUrl
  };
};

// Export all hooks for direct use if needed
export { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
export { useQuestionnaireFormHandlers } from "./useQuestionnaireFormHandlers";
export { useQuestionnaireFormState } from "./useQuestionnaireFormState";
export { useQuestionnaireUpdate } from "./useQuestionnaireUpdate";
export { useQuestionnaireCreate } from "./useQuestionnaireCreate";
export { useQuestionnaireFileHandlers } from "./useQuestionnaireFileHandlers";
