
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Wrench } from "lucide-react";

interface RoofAgeStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const RoofAgeStep: React.FC<RoofAgeStepProps> = ({ 
  value, 
  onChange, 
  onNext, 
  onPrevious 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Is your roof more than 20 years old?</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "yes" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("yes")}
        >
          <CardContent className="flex items-center p-4">
            <CheckCircle className="h-6 w-6 mr-4 text-primary" />
            <span className="font-medium">Yes</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "no" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("no")}
        >
          <CardContent className="flex items-center p-4">
            <XCircle className="h-6 w-6 mr-4 text-primary" />
            <span className="font-medium">No</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "replace" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("replace")}
        >
          <CardContent className="flex items-center p-4">
            <Wrench className="h-6 w-6 mr-4 text-primary" />
            <span className="font-medium">Yes – but I plan to replace it to go solar</span>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!value}>
          Continue
        </Button>
      </div>
    </div>
  );
};
