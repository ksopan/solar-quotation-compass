
import { useCallback } from "react";
import { QuestionnaireData } from "../types";
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useQuestionnaireFormHandlers = () => {
  const {
    questionnaire,
    setIsEditing,
    setFormData,
    formData,
    setIsSaving: setSaving
  } = useQuestionnaireProfileState();
  
  const handleEdit = useCallback(() => {
    console.log("handleEdit called from useQuestionnaireFormHandlers");
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
  
  const updateQuestionnaire = useCallback(async (data: Partial<QuestionnaireData>) => {
    if (!questionnaire) return false;
    
    setSaving(true);
    try {
      console.log("Updating questionnaire with:", data);
      
      const { error } = await supabase
        .from("property_questionnaires")
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq("id", questionnaire.id);
        
      if (error) {
        console.error("Error updating questionnaire:", error);
        toast.error("Failed to save your changes");
        return false;
      }
      
      toast.success("Profile saved successfully");
      return true;
    } catch (error) {
      console.error("Error in updateQuestionnaire:", error);
      toast.error("An error occurred while saving your changes");
      return false;
    } finally {
      setSaving(false);
    }
  }, [questionnaire, setSaving]);
  
  const handleSave = useCallback(async () => {
    if (!formData) return;
    
    const success = await updateQuestionnaire(formData);
    if (success) {
      setIsEditing(false);
      toast.success("Your profile has been updated");
    }
  }, [formData, updateQuestionnaire, setIsEditing]);
  
  const handleCancel = useCallback(() => {
    console.log("❌ Cancelling edit mode");
    if (questionnaire) {
      setFormData({...questionnaire}); // Reset form data to original
    }
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
  
  const createQuestionnaire = useCallback(async (data: Omit<QuestionnaireData, 'id' | 'created_at' | 'is_completed'>) => {
    setSaving(true);
    try {
      const { data: newQuestionnaire, error } = await supabase
        .from("property_questionnaires")
        .insert({
          ...data,
          is_completed: false
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating questionnaire:", error);
        toast.error("Failed to create your profile");
        return null;
      }
      
      toast.success("Your profile has been created");
      return newQuestionnaire;
    } catch (error) {
      console.error("Error in createQuestionnaire:", error);
      toast.error("An error occurred while creating your profile");
      return null;
    } finally {
      setSaving(false);
    }
  }, [setSaving]);
  
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
    handleChange,
    handleSave,
    handleCancel,
    handleSubmitProfile,
    handleCreateProfile,
    updateQuestionnaire,
    createQuestionnaire
  };
};
