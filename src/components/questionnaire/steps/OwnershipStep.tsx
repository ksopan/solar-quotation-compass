
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Building } from "lucide-react";

interface OwnershipStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const OwnershipStep: React.FC<OwnershipStepProps> = ({ 
  value, 
  onChange, 
  onNext, 
  onPrevious 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Do you own or rent this property?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "own" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("own")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Home className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">I own</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "rent" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("rent")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Building className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">I rent</span>
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
