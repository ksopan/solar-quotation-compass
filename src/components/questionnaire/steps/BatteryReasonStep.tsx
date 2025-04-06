
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Power, Lightbulb, Home } from "lucide-react";

interface BatteryReasonStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const BatteryReasonStep: React.FC<BatteryReasonStepProps> = ({ 
  value, 
  onChange, 
  onNext, 
  onPrevious 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">What's the main reason you want a battery?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "backup_power" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("backup_power")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Power className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">Back up power</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "maximize_savings" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("maximize_savings")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Lightbulb className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">Maximize savings</span>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${value === "self_supply" ? "border-2 border-primary bg-primary/5" : ""}`}
          onClick={() => onChange("self_supply")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Home className="h-12 w-12 mb-4 text-primary" />
            <span className="font-medium">Self supply</span>
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
