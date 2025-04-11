
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuestionnaireData } from "../context/QuestionnaireContext";

interface UseQuestionnaireSubmitProps {
  onOpenChange: (open: boolean) => void;
  formData: QuestionnaireData;
}

export const useQuestionnaireSubmit = ({ onOpenChange, formData }: UseQuestionnaireSubmitProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log("Submitting questionnaire:", formData);

      // Store in Supabase without linking to a user yet
      const { data, error } = await supabase
        .from("property_questionnaires")
        .insert({
          property_type: formData.property_type,
          ownership_status: formData.ownership_status,
          monthly_electric_bill: formData.monthly_electric_bill,
          interested_in_batteries: formData.interested_in_batteries,
          battery_reason: formData.battery_reason,
          purchase_timeline: formData.purchase_timeline,
          willing_to_remove_trees: formData.willing_to_remove_trees,
          roof_age_status: formData.roof_age_status,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          is_completed: false, // Mark as incomplete until verification
          customer_id: null // Will be linked after registration
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      // Store ID in session storage for later association
      if (data?.id) {
        sessionStorage.setItem("questionnaire_id", data.id);
        console.log("Saved questionnaire ID to session storage:", data.id);
      }

      // Success! Redirect to register page
      toast.success("Thank you for your submission! Please create an account to receive solar quotes.");
      onOpenChange(false);
      
      // Redirect to registration with a brief delay for toast to be visible
      setTimeout(() => navigate("/register"), 1000);
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      toast.error("Failed to submit your questionnaire. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
