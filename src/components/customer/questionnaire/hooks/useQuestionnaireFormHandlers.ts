
import { useCallback } from "react";
import { useQuestionnaireFormState } from "./useQuestionnaireFormState";
import { useQuestionnaireUpdate } from "./useQuestionnaireUpdate";
import { useQuestionnaireCreate } from "./useQuestionnaireCreate";

/**
 * Main hook that combines all questionnaire form handlers
 */
export const useQuestionnaireFormHandlers = () => {
  // Get form state management
  const {
    questionnaire,
    formData,
    setIsEditing,
    setIsSaving,
    user,
    handleEdit,
    handleChange,
    handleCancel,
    handleCreateProfile
  } = useQuestionnaireFormState();
  
  // Get questionnaire update operations
  const {
    updateQuestionnaire,
    handleSubmitProfile
  } = useQuestionnaireUpdate(questionnaire, setIsSaving);
  
  // Get questionnaire creation operations
  const {
    createQuestionnaire
  } = useQuestionnaireCreate(user, setIsSaving);
  
  // Combined save handler that either updates or creates a questionnaire
  const handleSave = useCallback(async () => {
    if (!formData) return;
    
    if (questionnaire) {
      // Update existing questionnaire
      const success = await updateQuestionnaire(formData);
      if (success) {
        setIsEditing(false);
        toast.success("Your profile has been updated");
      }
    } else if (user) {
      // Create new questionnaire
      const newQuestionnaire = await createQuestionnaire(formData);
      if (newQuestionnaire) {
        setIsEditing(false);
      }
    }
  }, [formData, questionnaire, updateQuestionnaire, createQuestionnaire, user, setIsEditing]);
  
  return {
    handleEdit,
    handleChange,
    handleSave,
    handleCancel,
    handleSubmitProfile,
    handleCreateProfile,
    updateQuestionnaire,
    createQuestionnaire
  };
};

// Add missing import for toast
import { toast } from "sonner";
