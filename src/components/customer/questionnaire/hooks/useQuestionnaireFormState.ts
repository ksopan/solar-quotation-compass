
import { useCallback } from "react";
import { QuestionnaireData } from "../types";
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";

/**
 * Hook for managing questionnaire form state and basic form operations
 */
export const useQuestionnaireFormState = () => {
  const {
    questionnaire,
    setIsEditing,
    setFormData,
    formData,
    setIsSaving,
    user
  } = useQuestionnaireProfileState();
  
  const handleEdit = useCallback(() => {
    console.log("handleEdit called from useQuestionnaireFormState");
    if (questionnaire) {
      // Create a deep copy of the questionnaire data
      setFormData({...questionnaire});
      // Set editing mode
      setIsEditing(true);
    } else {
      console.error("Cannot edit: questionnaire is null");
    }
  }, [questionnaire, setFormData, setIsEditing]);
  
  const handleChange = useCallback((field: keyof QuestionnaireData, value: any) => {
    console.log(`🔄 Updating form field ${String(field)} to:`, value);
    console.log("Current form data before update:", formData);
    
    setFormData(prev => {
      if (!prev) return { [field]: value };
      const updated = { ...prev, [field]: value };
      console.log("Updated form data:", updated);
      return updated;
    });
  }, [formData, setFormData]);
  
  const handleCancel = useCallback(() => {
    console.log("❌ Cancelling edit mode");
    if (questionnaire) {
      setFormData({...questionnaire}); // Reset form data to original
    }
    setIsEditing(false);
  }, [questionnaire, setFormData, setIsEditing]);
  
  const handleCreateProfile = useCallback(() => {
    console.log("🆕 Creating new profile");
    setFormData({
      property_type: "home",
      ownership_status: "own",
      monthly_electric_bill: 170,
      interested_in_batteries: false,
      battery_reason: null,
      purchase_timeline: "within_year",
      willing_to_remove_trees: false,
      roof_age_status: "no",
      first_name: "",
      last_name: "",
      email: ""
    });
    setIsEditing(true);
  }, [setFormData, setIsEditing]);
  
  return {
    questionnaire,
    formData,
    setFormData,
    setIsEditing,
    setIsSaving,
    user,
    handleEdit,
    handleChange,
    handleCancel,
    handleCreateProfile
  };
};
