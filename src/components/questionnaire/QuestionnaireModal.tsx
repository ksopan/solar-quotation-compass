
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuestionnaireStepIndicator } from "./QuestionnaireStepIndicator";
import { PropertyTypeStep } from "./steps/PropertyTypeStep";
import { OwnershipStep } from "./steps/OwnershipStep";
import { ElectricBillStep } from "./steps/ElectricBillStep";
import { BatteryInterestStep } from "./steps/BatteryInterestStep";
import { BatteryReasonStep } from "./steps/BatteryReasonStep";
import { PurchaseTimelineStep } from "./steps/PurchaseTimelineStep";
import { TreeRemovalStep } from "./steps/TreeRemovalStep";
import { RoofAgeStep } from "./steps/RoofAgeStep";
import { ContactInfoStep } from "./steps/ContactInfoStep";
import { SubmissionStep } from "./steps/SubmissionStep";

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

interface QuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuestionnaireData>({
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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log("Submitting questionnaire:", formData);

      // Store in Supabase
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
          email: formData.email
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      // Store ID in session storage for later association
      if (data?.id) {
        sessionStorage.setItem("questionnaire_id", data.id);
      }

      // Success! Redirect to register page
      toast.success("Thank you for your submission!");
      onOpenChange(false);
      setTimeout(() => navigate("/register"), 500);
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      toast.error("Failed to submit your questionnaire. Please try again.");
    } finally {
      setIsSubmitting(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Solar System Questionnaire</DialogTitle>
          <DialogDescription className="text-center">
            Help us understand your needs to get accurate quotes from top solar installers.
          </DialogDescription>
        </DialogHeader>
        
        <QuestionnaireStepIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
        />
        
        {shouldShowStep(1) && (
          <PropertyTypeStep 
            value={formData.property_type}
            onChange={(value) => handleChange("property_type", value)}
            onNext={handleNext}
          />
        )}
        
        {shouldShowStep(2) && (
          <OwnershipStep 
            value={formData.ownership_status}
            onChange={(value) => handleChange("ownership_status", value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        
        {shouldShowStep(3) && (
          <ElectricBillStep 
            value={formData.monthly_electric_bill}
            onChange={(value) => handleChange("monthly_electric_bill", value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        
        {shouldShowStep(4) && (
          <BatteryInterestStep 
            value={formData.interested_in_batteries}
            onChange={(value) => handleChange("interested_in_batteries", value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        
        {shouldShowStep(5) && (
          <BatteryReasonStep 
            value={formData.battery_reason || ""}
            onChange={(value) => handleChange("battery_reason", value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        
        {shouldShowStep(6) && (
          <PurchaseTimelineStep 
            value={formData.purchase_timeline}
            onChange={(value) => handleChange("purchase_timeline", value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        
        {shouldShowStep(7) && (
          <TreeRemovalStep 
            value={formData.willing_to_remove_trees}
            onChange={(value) => handleChange("willing_to_remove_trees", value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        
        {shouldShowStep(8) && (
          <RoofAgeStep 
            value={formData.roof_age_status}
            onChange={(value) => handleChange("roof_age_status", value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        
        {shouldShowStep(9) && (
          <ContactInfoStep 
            firstName={formData.first_name}
            lastName={formData.last_name}
            email={formData.email}
            onChange={(field, value) => handleChange(field as keyof QuestionnaireData, value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        
        {shouldShowStep(10) && (
          <SubmissionStep 
            formData={formData}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onPrevious={handlePrevious}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
