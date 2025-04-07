
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { QuestionnaireData } from "./useQuestionnaireBase";

export const useQuestionnaireActions = (
  questionnaire: QuestionnaireData | null,
  setQuestionnaire: (questionnaire: QuestionnaireData | null) => void
) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  // Update questionnaire data
  const updateQuestionnaire = async (updatedData: Partial<QuestionnaireData>) => {
    if (!user || !questionnaire) return false;
    
    try {
      setIsSaving(true);
      console.log("Updating questionnaire with:", updatedData);
      
      const { error } = await supabase
        .from("property_questionnaires")
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq("id", questionnaire.id)
        .eq("customer_id", user.id);
      
      if (error) {
        console.error("Error updating questionnaire:", error);
        toast.error("Failed to save your changes");
        return false;
      }
      
      // Update local state
      setQuestionnaire({ 
        ...questionnaire, 
        ...updatedData
      } as QuestionnaireData);
      
      toast.success("Your information has been updated");
      return true;
    } catch (error) {
      console.error("Error in updateQuestionnaire:", error);
      toast.error("An error occurred while saving your changes");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Create a new questionnaire for the user if they don't have one
  const createQuestionnaire = async (data: Omit<QuestionnaireData, 'id' | 'created_at' | 'is_completed'>) => {
    if (!user) return null;
    
    try {
      setIsSaving(true);
      console.log("Creating new questionnaire for user:", user.id);
      
      const { data: newQuestionnaire, error } = await supabase
        .from("property_questionnaires")
        .insert({
          ...data,
          customer_id: user.id,
          is_completed: false
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating questionnaire:", error);
        toast.error("Failed to create your profile");
        return null;
      }
      
      console.log("Created new questionnaire:", newQuestionnaire);
      setQuestionnaire(newQuestionnaire as QuestionnaireData);
      toast.success("Your profile has been created");
      return newQuestionnaire;
    } catch (error) {
      console.error("Error in createQuestionnaire:", error);
      toast.error("An error occurred while creating your profile");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return { 
    updateQuestionnaire, 
    createQuestionnaire,
    isSaving
  };
};
