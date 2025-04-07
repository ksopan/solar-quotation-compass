
import { useCallback } from "react";
import { QuestionnaireData } from "@/hooks/useQuestionnaire";
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireFormHandlers = () => {
  const {
    questionnaire,
    setIsEditing,
    setFormData,
    formData,
    updateQuestionnaire,
    createQuestionnaire
  } = useQuestionnaireProfileState();
  
  // This function will be overridden by the one in index.ts
  const handleEdit = useCallback(() => {
    console.log("⚠️ Secondary handleEdit called from useQuestionnaireFormHandlers");
    if (questionnaire) {
      console.log("Setting formData from secondary handler");
      setFormData({...questionnaire});
      console.log("Setting isEditing to TRUE from secondary handler");
      setIsEditing(true);
    } else {
      console.error("Cannot edit: questionnaire is null (secondary handler)");
    }
  }, [questionnaire, setFormData, setIsEditing]);
  
  const handleChange = useCallback((field: keyof QuestionnaireData, value: any) => {
    console.log(`🔄 Updating form field ${String(field)} to:`, value);
    console.log("Current form data before update:", formData);
    
    // Force React to detect the change with a new object reference
    setFormData(prev => {
      if (!prev) return { [field]: value };
      
      // Create a completely new object to ensure React detects the change
      const updated = { ...prev, [field]: value };
      console.log("Updated form data:", updated);
      return updated;
    });
  }, [formData, setFormData]);
  
  const handleSave = useCallback(async () => {
    if (!formData) return;
    
    let success = false;
    
    if (questionnaire) {
      success = await updateQuestionnaire(formData);
    } else {
      const requiredFields = [
        'property_type', 'ownership_status', 'monthly_electric_bill',
        'interested_in_batteries', 'purchase_timeline', 'willing_to_remove_trees',
        'roof_age_status', 'first_name', 'last_name', 'email'
      ];
      
      const missingFields = requiredFields.filter(field => 
        !formData[field as keyof QuestionnaireData]
      );
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      const newQuestionnaire = await createQuestionnaire(formData as any);
      success = !!newQuestionnaire;
    }
    
    if (success) {
      console.log("✅ Profile saved successfully, exiting edit mode");
      setIsEditing(false);
      toast.success("Profile saved successfully!");
    }
  }, [formData, questionnaire, updateQuestionnaire, createQuestionnaire, setIsEditing]);
  
  const handleCancel = useCallback(() => {
    console.log("❌ Cancelling edit mode");
    if (questionnaire) {
      setFormData({...questionnaire}); // Reset form data to original
    }
    console.log("🔙 Setting isEditing to FALSE");
    setIsEditing(false);
  }, [questionnaire, setFormData, setIsEditing]);
  
  const handleSubmitProfile = useCallback(async () => {
    if (!questionnaire) return;
    
    try {
      const { error } = await supabase
        .from("property_questionnaires")
        .update({ is_completed: true })
        .eq("id", questionnaire.id);
        
      if (error) {
        console.error("Error submitting profile:", error);
        toast.error("Failed to submit your profile");
        return;
      }
      
      toast.success("Your profile has been submitted successfully!");
    } catch (error) {
      console.error("Error in handleSubmitProfile:", error);
      toast.error("An error occurred while submitting your profile");
    }
  }, [questionnaire]);
  
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
    console.log("🖊️ Setting isEditing to TRUE for new profile creation");
    setIsEditing(true);
  }, [setFormData, setIsEditing]);
  
  return {
    handleEdit,
    handleChange,
    handleSave,
    handleCancel,
    handleSubmitProfile,
    handleCreateProfile
  };
};
