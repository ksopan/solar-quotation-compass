
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, HelpCircle } from "lucide-react";

interface PurchaseTimelineStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const PurchaseTimelineStep: React.FC<PurchaseTimelineStepProps> = ({ 
  value, 
  onChange, 
  onNext, 
  onPrevious 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">When do you plan to purchase a solar system?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "within_months" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("within_months")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Calendar className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium text-center">Within the next few months</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "within_year" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("within_year")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Clock className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium text-center">Within the next year</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "not_sure" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("not_sure")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <HelpCircle className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium text-center">I'm not sure</span>
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
