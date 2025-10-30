
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Battery, BatteryCharging } from "lucide-react";
import { toast } from "sonner";

interface BatteryInterestStepProps {
  value: boolean;
  onChange: (value: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const BatteryInterestStep: React.FC<BatteryInterestStepProps> = ({ 
  value, 
  onChange, 
  onNext, 
  onPrevious 
}) => {
  const [hasSelected, setHasSelected] = useState(false);

  const handleSelection = (selection: boolean) => {
    onChange(selection);
    setHasSelected(true);
  };

  const handleContinue = () => {
    if (!hasSelected) {
      toast.error("Please select an option to continue");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Are you interested in solar batteries?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === true ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => handleSelection(true)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <BatteryCharging className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">Yes</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === false && hasSelected ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => handleSelection(false)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Battery className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">No</span>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
};
