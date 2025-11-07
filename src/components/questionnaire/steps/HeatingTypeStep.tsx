import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface HeatingTypeStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const HeatingTypeStep: React.FC<HeatingTypeStepProps> = ({
  value,
  onChange,
  onNext,
  onPrevious
}) => {
  const heatingTypes = [
    { id: "gas", label: "Gas" },
    { id: "electric", label: "Electric" },
    { id: "both", label: "Both" },
    { id: "dont_know", label: "Don't Know" }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">What type of heating do you have?</h3>
      
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="space-y-3">
          {heatingTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <RadioGroupItem value={type.id} id={type.id} />
              <Label htmlFor={type.id} className="cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

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
