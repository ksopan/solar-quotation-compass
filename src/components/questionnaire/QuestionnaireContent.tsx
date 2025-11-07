
import React from "react";
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
import { useQuestionnaire } from "./context/QuestionnaireContext";
import { useQuestionnaireSubmit } from "./hooks/useQuestionnaireSubmit";

interface QuestionnaireContentProps {
  onOpenChange: (open: boolean) => void;
}

export const QuestionnaireContent: React.FC<QuestionnaireContentProps> = ({ 
  onOpenChange 
}) => {
  const { 
    currentStep, 
    totalSteps, 
    formData,
    handleChange, 
    handleNext, 
    handlePrevious, 
    shouldShowStep 
  } = useQuestionnaire();
  
  const { isSubmitting, handleSubmit } = useQuestionnaireSubmit({
    onOpenChange,
    formData
  });
  
  return (
    <>
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
          phone={formData.phone}
          onChange={(field, value) => handleChange(field as keyof typeof formData, value)}
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
    </>
  );
};
