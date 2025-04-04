
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface QuotationMetricsProps {
  energyUsage: number;
  roofArea: number;
  onEnergyUsageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoofAreaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const QuotationMetrics: React.FC<QuotationMetricsProps> = ({
  energyUsage,
  roofArea,
  onEnergyUsageChange,
  onRoofAreaChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="energyUsage">Monthly Energy Usage (kWh)</Label>
        <Input
          id="energyUsage"
          name="energyUsage"
          type="number"
          min="0"
          step="any"
          value={energyUsage || ""}
          onChange={onEnergyUsageChange}
          placeholder="e.g., 500"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="roofArea">Roof Area (sq ft)</Label>
        <Input
          id="roofArea"
          name="roofArea"
          type="number"
          min="0"
          step="any"
          value={roofArea || ""}
          onChange={onRoofAreaChange}
          placeholder="e.g., 1000"
        />
      </div>
    </div>
  );
};
