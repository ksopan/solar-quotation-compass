
import React, { createContext, useState, useContext } from "react";

export interface QuestionnaireData {
  id?: string;
  property_type: string;
  ownership_status: string;
  monthly_electric_bill: number;
  interested_in_batteries: boolean;
  battery_reason: string | null;
  purchase_timeline: string;
  willing_to_remove_trees: boolean;
  roof_age_status: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface QuestionnaireContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: QuestionnaireData;
  setFormData: (data: QuestionnaireData) => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  totalSteps: number;
  handleChange: (field: keyof QuestionnaireData, value: any) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  shouldShowStep: (stepNumber: number) => boolean;
}

const defaultFormData: QuestionnaireData = {
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
};

export const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export const QuestionnaireProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<QuestionnaireData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total steps based on whether batteries are selected
  const totalSteps = formData.interested_in_batteries ? 10 : 9;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (field: keyof QuestionnaireData, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });

    // Special handling for battery interest - skip reason step if not interested
    if (field === "interested_in_batteries" && value === false && currentStep === 4) {
      setTimeout(() => setCurrentStep(6), 300); // Small delay for animation
    }
  };

  // Determine if we should show the current step
  const shouldShowStep = (stepNumber: number) => {
    // Skip battery reason step if not interested in batteries
    if (stepNumber === 5 && !formData.interested_in_batteries) {
      return false;
    }
    return stepNumber === currentStep;
  };

  const value = {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    totalSteps,
    handleChange,
    handleNext,
    handlePrevious,
    shouldShowStep
  };

  return (
    <QuestionnaireContext.Provider value={value}>
      {children}
    </QuestionnaireContext.Provider>
  );
};

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  
  if (context === undefined) {
    throw new Error("useQuestionnaire must be used within a QuestionnaireProvider");
  }
  
  return context;
};
