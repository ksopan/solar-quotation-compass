
import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Battery, BatteryCharging, Power, Lightbulb, Home, Info } from "lucide-react";
import { QuestionnaireData } from "@/hooks/useQuestionnaire";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
  // Function to render the appropriate icon based on the battery reason
  const getBatteryReasonIcon = (reason: string | null | undefined) => {
    switch(reason) {
      case "backup_power": return <Power className="h-5 w-5 text-blue-500" />;
      case "maximize_savings": return <Lightbulb className="h-5 w-5 text-orange-500" />;
      case "self_supply": return <Home className="h-5 w-5 text-green-500" />;
      default: return null;
    }
  };

  // Function to render the user-friendly reason text
  const getBatteryReasonText = (reason: string | null | undefined) => {
    switch(reason) {
      case "backup_power": return "Back up power";
      case "maximize_savings": return "Maximize savings";
      case "self_supply": return "Self supply";
      default: return "Not specified";
    }
  };

  // Battery reason descriptions for hover cards
  const getBatteryReasonDescription = (reason: string | null | undefined) => {
    switch(reason) {
      case "backup_power": 
        return "Power your essential appliances during grid outages, ensuring your home remains functional.";
      case "maximize_savings": 
        return "Store excess energy produced during the day to use at night, reducing your reliance on grid electricity.";
      case "self_supply": 
        return "Aim for energy independence by generating and storing your own clean electricity.";
      default: 
        return "";
    }
  };

  return (
    <div className="space-y-6 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-white">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-purple-100 p-2 rounded-full">
          {data?.interested_in_batteries 
            ? <BatteryCharging className="h-6 w-6 text-purple-600" />
            : <Battery className="h-6 w-6 text-neutral-500" />}
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <Label className="text-lg font-semibold text-purple-900">Battery Storage</Label>
            {!isEditing && data?.interested_in_batteries && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Interested
              </span>
            )}
          </div>
          
          {isEditing ? (
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                checked={data?.interested_in_batteries} 
                onCheckedChange={(checked) => handleChange("interested_in_batteries", checked)}
              />
              <span className="text-sm text-gray-700">{data?.interested_in_batteries ? "Interested in batteries" : "Not interested in batteries"}</span>
            </div>
          ) : (
            <div className="mt-1 text-gray-600">
              {data?.interested_in_batteries 
                ? "You've expressed interest in adding battery storage to your solar system."
                : "You haven't expressed interest in battery storage at this time."}
            </div>
          )}
        </div>
      </div>
      
      {data?.interested_in_batteries && (
        <div className="pl-10 border-l-2 border-purple-100 ml-5 mt-2">
          <div className="mb-4">
            <Label className="text-sm text-gray-500 mb-1">Primary Reason</Label>
            {isEditing ? (
              <Select 
                value={data?.battery_reason || ""} 
                onValueChange={(value) => handleChange("battery_reason", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backup_power">Back up power</SelectItem>
                  <SelectItem value="maximize_savings">Maximize savings</SelectItem>
                  <SelectItem value="self_supply">Self supply</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-white rounded-md shadow-sm border border-gray-100">
                {getBatteryReasonIcon(data?.battery_reason)}
                <span className="font-medium text-gray-800">{getBatteryReasonText(data?.battery_reason)}</span>
                
                {data?.battery_reason && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <button className="ml-1">
                        <Info className="h-4 w-4 text-gray-400" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 text-sm">
                      {getBatteryReasonDescription(data?.battery_reason)}
                    </HoverCardContent>
                  </HoverCard>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="pt-2">
        <Label className="text-gray-700">Purchase Timeline</Label>
        {isEditing ? (
          <Select 
            value={data?.purchase_timeline} 
            onValueChange={(value) => handleChange("purchase_timeline", value)}
          >
            <SelectTrigger className="bg-white mt-1">
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="within_months">Within the next few months</SelectItem>
              <SelectItem value="within_year">Within the next year</SelectItem>
              <SelectItem value="not_sure">I'm not sure</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="mt-1 text-gray-600 p-2 bg-gray-50 rounded-md">
            {data?.purchase_timeline === "within_months" ? (
              <span className="text-green-600 font-medium">Within the next few months</span>
            ) : data?.purchase_timeline === "within_year" ? (
              <span className="text-blue-600 font-medium">Within the next year</span>
            ) : data?.purchase_timeline === "not_sure" ? (
              <span className="text-gray-600 font-medium">I'm not sure</span>
            ) : ""}
          </div>
        )}
      </div>
    </div>
  );
};
