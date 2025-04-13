
import { useCallback } from 'react';
import { QuestionnaireData } from '../types';

/**
 * Hook for handling edit mode operations in the questionnaire
 */
export const useEditMode = (
  questionnaire: QuestionnaireData | null,
  setFormData: (data: Partial<QuestionnaireData> | null) => void,
  setIsEditing: (isEditing: boolean) => void
) => {
  // Handle editing
  const handleEdit = useCallback(() => {
    console.log("🔑 handleEdit called");
    if (questionnaire) {
      setFormData({ ...questionnaire });
      setIsEditing(true);
    } else {
      console.error("Cannot edit: questionnaire is null");
    }
  }, [questionnaire, setFormData, setIsEditing]);

  // Handle cancelling edits
  const handleCancel = useCallback(() => {
    console.log("❌ Cancelling edit mode");
    if (questionnaire) {
      setFormData({ ...questionnaire });
    }
    setIsEditing(false);
  }, [questionnaire, setFormData, setIsEditing]);

  // Handle creating a new profile
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
    handleEdit,
    handleCancel,
    handleCreateProfile
  };
};
