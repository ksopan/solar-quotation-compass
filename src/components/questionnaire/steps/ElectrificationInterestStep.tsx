import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ElectrificationInterestStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const ElectrificationInterestStep: React.FC<ElectrificationInterestStepProps> = ({
  value,
  onChange,
  onNext,
  onPrevious
}) => {
  const options = [
    { id: "yes", label: "Yes, I want to electrify my home" },
    { id: "no", label: "No, not interested" },
    { id: "just_solar", label: "Just Solar for now" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Are you interested in home electrification?</h3>
        <p className="text-sm text-muted-foreground">
          Home electrification involves replacing gas appliances with electric alternatives like heat pumps, induction stoves, and electric water heaters.
        </p>
      </div>
      
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="space-y-3">
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.id} id={option.id} />
              <Label htmlFor={option.id} className="cursor-pointer">
                {option.label}
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
