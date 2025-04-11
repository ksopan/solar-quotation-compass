
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuestionnaireProvider } from "./context/QuestionnaireContext";
import { QuestionnaireContent } from "./QuestionnaireContent";

interface QuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Solar System Questionnaire</DialogTitle>
          <DialogDescription className="text-center">
            Help us understand your needs to get accurate quotes from top solar installers.
          </DialogDescription>
        </DialogHeader>
        
        <QuestionnaireProvider>
          <QuestionnaireContent onOpenChange={onOpenChange} />
        </QuestionnaireProvider>
      </DialogContent>
    </Dialog>
  );
};
