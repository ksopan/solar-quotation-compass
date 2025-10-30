
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuestionnaireData } from "../context/QuestionnaireContext";
import { supabase } from "@/integrations/supabase/client";

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
      console.log("Creating questionnaire in database:", formData);

      // Create the questionnaire in the database with pending_verification status
      const { data: questionnaire, error: createError } = await supabase
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
          status: 'pending_verification',
          is_completed: false,
          customer_id: null, // Will be linked after registration
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating questionnaire:", createError);
        toast.error("Failed to submit your questionnaire. Please try again.");
        return;
      }

      console.log("Questionnaire created successfully:", questionnaire);

      // Send verification email
      const { error: emailError } = await supabase.functions.invoke("send-verification-email", {
        body: {
          email: formData.email,
          firstName: formData.first_name,
          lastName: formData.last_name,
          verificationToken: questionnaire.verification_token,
        },
      });

      if (emailError) {
        console.error("Error sending verification email:", emailError);
        toast.error("Questionnaire submitted but failed to send verification email.");
        return;
      }

      // Store questionnaire data in sessionStorage for later registration
      sessionStorage.setItem("questionnaire_data", JSON.stringify(formData));
      sessionStorage.setItem("questionnaire_id", questionnaire.id);
      
      // Success! Show message and close modal
      toast.success("Thank you! Please check your email to verify your request.");
      onOpenChange(false);
      
      // Redirect to a success page or show registration option
      setTimeout(() => navigate("/?submitted=success"), 1000);
    } catch (error) {
      console.error("Error handling questionnaire:", error);
      toast.error("Failed to process your questionnaire. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
