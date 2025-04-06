
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionnaireData } from "@/hooks/useQuestionnaire";

interface PropertyConstraintsSectionProps {
  isEditing: boolean;
  data: Partial<QuestionnaireData> | null;
  handleChange: (field: keyof QuestionnaireData, value: any) => void;
}

export const PropertyConstraintsSection: React.FC<PropertyConstraintsSectionProps> = ({ 
  isEditing, 
  data, 
  handleChange 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label>Remove Trees for Solar</Label>
        {isEditing ? (
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              checked={data?.willing_to_remove_trees} 
              onCheckedChange={(checked) => handleChange("willing_to_remove_trees", checked)}
            />
            <span>{data?.willing_to_remove_trees ? "Yes" : "No"}</span>
          </div>
        ) : (
          <div className="mt-1 text-lg">
            • {data?.willing_to_remove_trees ? "Yes" : "No"}
          </div>
        )}
      </div>
      
      <div>
        <Label>Roof Age Status</Label>
        {isEditing ? (
          <Select 
            value={data?.roof_age_status} 
            onValueChange={(value) => handleChange("roof_age_status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select roof age status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">Yes, more than 20 years old</SelectItem>
              <SelectItem value="no">No, less than 20 years old</SelectItem>
              <SelectItem value="replace">Yes, but I plan to replace it</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="mt-1 text-lg">
            {data?.roof_age_status === "yes" ? "More than 20 years old" : 
             data?.roof_age_status === "no" ? "Less than 20 years old" : 
             data?.roof_age_status === "replace" ? "More than 20 years old, but planning to replace" : ""}
          </div>
        )}
      </div>
    </div>
  );
};
