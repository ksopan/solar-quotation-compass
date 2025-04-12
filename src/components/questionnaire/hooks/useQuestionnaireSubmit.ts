
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
      console.log("Storing questionnaire in sessionStorage:", formData);

      // Store the entire questionnaire data in sessionStorage
      sessionStorage.setItem("questionnaire_data", JSON.stringify(formData));
      
      // Success! Redirect to register page
      toast.success("Thank you! Please create an account to receive solar quotes.");
      onOpenChange(false);
      
      // Redirect to registration with a brief delay for toast to be visible
      setTimeout(() => navigate("/register"), 1000);
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
