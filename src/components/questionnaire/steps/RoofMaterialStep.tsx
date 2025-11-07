import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RoofMaterialStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const RoofMaterialStep: React.FC<RoofMaterialStepProps> = ({
  value,
  onChange,
  onNext,
  onPrevious
}) => {
  const roofMaterials = [
    { id: "asphalt_shingles", label: "Asphalt Shingles" },
    { id: "metal", label: "Metal" },
    { id: "tile", label: "Tile" },
    { id: "other", label: "Other" },
    { id: "dont_know", label: "Don't Know" }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">What is your roof material?</h3>
      
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="space-y-3">
          {roofMaterials.map((material) => (
            <div key={material.id} className="flex items-center space-x-2">
              <RadioGroupItem value={material.id} id={material.id} />
              <Label htmlFor={material.id} className="cursor-pointer">
                {material.label}
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
