
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { QuestionnaireData } from "@/hooks/useQuestionnaire";

interface PropertyInfoSectionProps {
  isEditing: boolean;
  data: Partial<QuestionnaireData> | null;
  handleChange: (field: keyof QuestionnaireData, value: any) => void;
}

export const PropertyInfoSection: React.FC<PropertyInfoSectionProps> = ({ 
  isEditing, 
  data, 
  handleChange 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label>Property Type</Label>
          {isEditing ? (
            <Select 
              value={data?.property_type} 
              onValueChange={(value) => handleChange("property_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="nonprofit">Nonprofit</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="mt-1 text-lg">
              {data?.property_type === "home" ? "Home" : 
               data?.property_type === "business" ? "Business" : 
               data?.property_type === "nonprofit" ? "Nonprofit" : ""}
            </div>
          )}
        </div>
        
        <div>
          <Label>Ownership Status</Label>
          {isEditing ? (
            <Select 
              value={data?.ownership_status} 
              onValueChange={(value) => handleChange("ownership_status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ownership status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="own">I own</SelectItem>
                <SelectItem value="rent">I rent</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="mt-1 text-lg">
              {data?.ownership_status === "own" ? "I own" : "I rent"}
            </div>
          )}
        </div>
        
        <div>
          <Label>Monthly Electric Bill</Label>
          {isEditing ? (
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>${data?.monthly_electric_bill}</span>
              </div>
              <Slider 
                value={[data?.monthly_electric_bill || 170]} 
                min={50} 
                max={1200} 
                step={10}
                onValueChange={(values) => handleChange("monthly_electric_bill", values[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$50</span>
                <span>$1200</span>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-lg">${data?.monthly_electric_bill}</div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Additional fields moved to BatterySection component */}
      </div>
    </div>
  );
};
