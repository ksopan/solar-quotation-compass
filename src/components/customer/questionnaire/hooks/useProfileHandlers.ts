
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QuestionnaireData } from '../types';

export const useProfileHandlers = (
  user: any,
  state: {
    questionnaire: QuestionnaireData | null;
    formData: Partial<QuestionnaireData> | null;
    attachments: Array<{name: string; size: number; id?: string;}>;
  },
  dispatch: React.Dispatch<any>
) => {
  // Handle editing
  const handleEdit = useCallback(() => {
    console.log("🔑 handleEdit called");
    if (state.questionnaire) {
      dispatch({ 
        type: 'EDIT_MODE', 
        payload: { questionnaire: state.questionnaire } 
      });
    } else {
      console.error("Cannot edit: questionnaire is null");
    }
  }, [state.questionnaire, dispatch]);

  // Handle form field changes
  const handleChange = useCallback((field: keyof QuestionnaireData, value: any) => {
    console.log(`🔄 Updating form field ${String(field)} to:`, value);
    dispatch({ 
      type: 'UPDATE_FORM_FIELD', 
      payload: { field, value } 
    });
  }, [dispatch]);

  // Handle saving changes
  const handleSave = useCallback(async () => {
    if (!state.formData) return;
    
    try {
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
      if (state.questionnaire) {
        // Update existing questionnaire
        console.log("Updating questionnaire with:", state.formData);
        
        const { error } = await supabase
          .from("property_questionnaires")
          .update({
            ...state.formData,
            updated_at: new Date().toISOString()
          })
          .eq("id", state.questionnaire.id);
          
        if (error) {
          console.error("Error updating questionnaire:", error);
          toast.error("Failed to save your changes");
          return;
        }
        
        // Update the questionnaire with the form data
        dispatch({ type: 'SET_QUESTIONNAIRE', payload: {
          ...state.questionnaire,
          ...state.formData
        } as QuestionnaireData });
      } else if (user) {
        // Create new questionnaire
        console.log("Creating new questionnaire for user:", user.id);
        
        // Ensure all required fields are present
        const questionnaireData = {
          property_type: state.formData.property_type || "home",
          ownership_status: state.formData.ownership_status || "own",
          monthly_electric_bill: state.formData.monthly_electric_bill || 0,
          interested_in_batteries: state.formData.interested_in_batteries !== undefined ? state.formData.interested_in_batteries : false,
          battery_reason: state.formData.battery_reason || null,
          purchase_timeline: state.formData.purchase_timeline || "within_year",
          willing_to_remove_trees: state.formData.willing_to_remove_trees !== undefined ? state.formData.willing_to_remove_trees : false,
          roof_age_status: state.formData.roof_age_status || "no",
          first_name: state.formData.first_name || "",
          last_name: state.formData.last_name || "",
          email: state.formData.email || "",
          customer_id: user.id,
          is_completed: false
        };
          
        const { data: newQuestionnaire, error } = await supabase
          .from("property_questionnaires")
          .insert(questionnaireData)
          .select()
          .single();
          
        if (error) {
          console.error("Error creating questionnaire:", error);
          toast.error("Failed to create your profile");
          return;
        }
        
        console.log("Created new questionnaire:", newQuestionnaire);
        
        // Set the new questionnaire
        dispatch({ type: 'SET_QUESTIONNAIRE', payload: newQuestionnaire as QuestionnaireData });
        toast.success("Your profile has been created");
      }
      
      // Exit edit mode
      dispatch({ type: 'SET_IS_EDITING', payload: false });
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("An error occurred while saving your changes");
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  }, [state.formData, state.questionnaire, user, dispatch]);

  // Handle cancelling edits
  const handleCancel = useCallback(() => {
    console.log("❌ Cancelling edit mode");
    dispatch({ type: 'CANCEL_EDIT' });
  }, [dispatch]);

  // Handle creating a new profile
  const handleCreateProfile = useCallback(() => {
    console.log("🆕 Creating new profile");
    dispatch({ 
      type: 'SET_FORM_DATA', 
      payload: {
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
      }
    });
    dispatch({ type: 'SET_IS_EDITING', payload: true });
  }, [dispatch]);

  // Handle submitting profile
  const handleSubmitProfile = useCallback(async () => {
    if (!state.questionnaire) return;
    
    try {
      const { error } = await supabase
        .from("property_questionnaires")
        .update({ is_completed: true })
        .eq("id", state.questionnaire.id);
        
      if (error) {
        console.error("Error submitting profile:", error);
        toast.error("Failed to submit your profile");
        return;
      }
      
      // Update local state
      dispatch({ 
        type: 'SET_QUESTIONNAIRE', 
        payload: { ...state.questionnaire, is_completed: true } 
      });
      dispatch({ type: 'SET_SHOW_SUBMIT_BUTTON', payload: false });
      
      toast.success("Your profile has been submitted successfully!");
    } catch (error) {
      console.error("Error in handleSubmitProfile:", error);
      toast.error("An error occurred while submitting your profile");
    }
  }, [state.questionnaire, dispatch]);

  return {
    handleEdit,
    handleChange,
    handleSave,
    handleCancel,
    handleCreateProfile,
    handleSubmitProfile
  };
};
