
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionnaireData } from "@/hooks/useQuestionnaire";

interface BatterySectionProps {
  isEditing: boolean;
  data: Partial<QuestionnaireData> | null;
  handleChange: (field: keyof QuestionnaireData, value: any) => void;
}

export const BatterySection: React.FC<BatterySectionProps> = ({ 
  isEditing, 
  data, 
  handleChange 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Interested in Batteries</Label>
        {isEditing ? (
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              checked={data?.interested_in_batteries} 
              onCheckedChange={(checked) => handleChange("interested_in_batteries", checked)}
            />
            <span>{data?.interested_in_batteries ? "Yes" : "No"}</span>
          </div>
        ) : (
          <div className="mt-1 text-lg">
            • {data?.interested_in_batteries ? "Yes" : "No"}
          </div>
        )}
      </div>
      
      {data?.interested_in_batteries && (
        <div>
          <Label>Battery Reason</Label>
          {isEditing ? (
            <Select 
              value={data?.battery_reason || ""} 
              onValueChange={(value) => handleChange("battery_reason", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backup_power">Back up power</SelectItem>
                <SelectItem value="maximize_savings">Maximize savings</SelectItem>
                <SelectItem value="self_supply">Self supply</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="mt-1 text-lg">
              {data?.battery_reason === "backup_power" ? "Back up power" : 
               data?.battery_reason === "maximize_savings" ? "Maximize savings" : 
               data?.battery_reason === "self_supply" ? "Self supply" : "Not specified"}
            </div>
          )}
        </div>
      )}
      
      <div>
        <Label>Purchase Timeline</Label>
        {isEditing ? (
          <Select 
            value={data?.purchase_timeline} 
            onValueChange={(value) => handleChange("purchase_timeline", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="within_months">Within the next few months</SelectItem>
              <SelectItem value="within_year">Within the next year</SelectItem>
              <SelectItem value="not_sure">I'm not sure</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="mt-1 text-lg">
            {data?.purchase_timeline === "within_months" ? "Within the next few months" : 
             data?.purchase_timeline === "within_year" ? "Within the next year" : 
             data?.purchase_timeline === "not_sure" ? "I'm not sure" : ""}
          </div>
        )}
      </div>
    </div>
  );
};
