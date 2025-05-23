
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface TreeRemovalStepProps {
  value: boolean;
  onChange: (value: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const TreeRemovalStep: React.FC<TreeRemovalStepProps> = ({ 
  value, 
  onChange, 
  onNext, 
  onPrevious 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">If necessary, would you remove trees to go solar?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === true ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange(true)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <CheckCircle className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">Yes</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === false ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange(false)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <XCircle className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">No</span>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};
