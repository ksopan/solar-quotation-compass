
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ElectricBillStepProps {
  value: number;
  onChange: (value: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const ElectricBillStep: React.FC<ElectricBillStepProps> = ({ 
  value, 
  onChange, 
  onNext, 
  onPrevious 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">How much is your average monthly electric bill?</h3>
      
      <div className="space-y-6 py-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Monthly Electric Bill: ${value}</Label>
          </div>
          <Slider 
            defaultValue={[value]} 
            min={50} 
            max={1200} 
            step={10}
            onValueChange={(values) => onChange(values[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$50</span>
            <span>$1200</span>
          </div>
        </div>
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
