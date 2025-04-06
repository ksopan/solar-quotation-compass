
import React from "react";

interface QuestionnaireStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const QuestionnaireStepIndicator: React.FC<QuestionnaireStepIndicatorProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  const progress = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <div className="w-full py-4">
      <div className="flex justify-between mb-1 text-xs text-gray-500">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{progress}% Complete</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
