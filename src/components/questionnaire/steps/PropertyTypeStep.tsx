
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Building2, LandPlot } from "lucide-react";

interface PropertyTypeStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export const PropertyTypeStep: React.FC<PropertyTypeStepProps> = ({ 
  value, 
  onChange, 
  onNext 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">What type of property do you want quotes for?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "home" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("home")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Home className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">Home</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "business" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("business")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Building2 className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">Business</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "nonprofit" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("nonprofit")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <LandPlot className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">Nonprofit</span>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!value}>
          Continue
        </Button>
      </div>
    </div>
  );
};
