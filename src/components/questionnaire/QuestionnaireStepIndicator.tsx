
import React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="w-full py-4 space-y-4">
      {/* Text indicators */}
      <div className="flex justify-between text-sm">
        <span className="font-medium">Step {currentStep} of {totalSteps}</span>
        <span className="text-muted-foreground">{progress}% Complete</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep >= stepNumber;
          const isCurrentStep = currentStep === stepNumber;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  isCurrentStep && "ring-2 ring-primary ring-offset-2"
                )}
              >
                {isActive && stepNumber < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : isCurrentStep ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-xs">{stepNumber}</span>
                )}
              </div>
              {/* Display connector lines between steps */}
              {stepNumber < totalSteps && (
                <div className="absolute h-[2px] w-[calc(100%/var(--total-steps)-1rem)] bg-muted" style={{ 
                  left: `calc(${index * (100 / (totalSteps - 1))}% + 1rem)`, 
                  top: "6.25rem",
                  "--total-steps": totalSteps
                } as React.CSSProperties} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
