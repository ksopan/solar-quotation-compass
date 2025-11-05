
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
      console.log("🚀 Starting questionnaire submission...");
      console.log("📝 Form data:", formData);
      console.log("👤 Current auth user:", (await supabase.auth.getUser()).data.user);

      // Create the questionnaire in the database with pending_verification status
      console.log("💾 Attempting to insert questionnaire into database...");
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
        console.error("❌ Error creating questionnaire:", createError);
        console.error("❌ Error details:", JSON.stringify(createError, null, 2));
        toast.error("Failed to submit your questionnaire. Please try again.");
        return;
      }

      console.log("✅ Questionnaire created successfully!");
      console.log("📄 Questionnaire data:", questionnaire);

      // Send verification email
      console.log("📧 Attempting to send verification email...");
      console.log("📧 Email parameters:", {
        email: formData.email,
        firstName: formData.first_name,
        lastName: formData.last_name,
        hasToken: !!questionnaire.verification_token,
      });

      const { data: emailData, error: emailError } = await supabase.functions.invoke("send-verification-email", {
        body: {
          email: formData.email,
          firstName: formData.first_name,
          lastName: formData.last_name,
          verificationToken: questionnaire.verification_token,
        },
      });

      if (emailError) {
        console.error("❌ Error sending verification email:", emailError);
        console.error("❌ Email error details:", JSON.stringify(emailError, null, 2));
        toast.error("Questionnaire submitted but failed to send verification email.");
        return;
      }

      console.log("✅ Verification email sent successfully!");
      console.log("📧 Email response:", emailData);

      // Store questionnaire data in BOTH localStorage AND sessionStorage for persistence
      console.log("💾 Storing data in localStorage and sessionStorage...");
      const storageData = {
        id: questionnaire.id,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name
      };
      localStorage.setItem("questionnaire_data", JSON.stringify(storageData));
      localStorage.setItem("questionnaire_id", questionnaire.id);
      localStorage.setItem("questionnaire_email", formData.email);
      sessionStorage.setItem("questionnaire_data", JSON.stringify(storageData));
      sessionStorage.setItem("questionnaire_id", questionnaire.id);
      
      // Success! Show message and close modal
      console.log("🎉 Questionnaire submission complete!");
      toast.success("Thank you! Please check your email to verify your request.");
      onOpenChange(false);
      
      // Redirect to a success page or show registration option
      setTimeout(() => navigate("/?submitted=success"), 1000);
    } catch (error) {
      console.error("❌ Unexpected error handling questionnaire:", error);
      console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      toast.error("Failed to process your questionnaire. Please try again.");
    } finally {
      setIsSubmitting(false);
      console.log("🔄 Submission process ended");
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
