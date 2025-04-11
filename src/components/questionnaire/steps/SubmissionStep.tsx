import React from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { QuestionnaireData } from "../context/QuestionnaireContext";

interface SubmissionStepProps {
  formData: QuestionnaireData;
  isSubmitting: boolean;
  onSubmit: () => void;
  onPrevious: () => void;
}

export const SubmissionStep: React.FC<SubmissionStepProps> = ({ 
  formData, 
  isSubmitting, 
  onSubmit, 
  onPrevious 
}) => {
  // Format the values for display
  const formatPropertyType = (type: string) => {
    switch(type) {
      case "home": return "Home";
      case "business": return "Business";
      case "nonprofit": return "Nonprofit";
      default: return type;
    }
  };
  
  const formatOwnership = (status: string) => {
    return status === "own" ? "I own" : "I rent";
  };
  
  const formatPurchaseTimeline = (timeline: string) => {
    switch(timeline) {
      case "within_months": return "Within the next few months";
      case "within_year": return "Within the next year";
      case "not_sure": return "I'm not sure";
      default: return timeline;
    }
  };
  
  const formatBatteryReason = (reason: string | null) => {
    if (!reason) return "N/A";
    switch(reason) {
      case "backup_power": return "Back up power";
      case "maximize_savings": return "Maximize savings";
      case "self_supply": return "Self supply";
      default: return reason;
    }
  };
  
  const formatRoofAge = (status: string) => {
    switch(status) {
      case "yes": return "Yes";
      case "no": return "No";
      case "replace": return "Yes – but I plan to replace it";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Review Your Information</h3>
      
      <div className="border rounded-md p-4 bg-muted/30 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm font-medium">Property Type:</div>
          <div className="text-sm">{formatPropertyType(formData.property_type)}</div>
          
          <div className="text-sm font-medium">Ownership Status:</div>
          <div className="text-sm">{formatOwnership(formData.ownership_status)}</div>
          
          <div className="text-sm font-medium">Monthly Electric Bill:</div>
          <div className="text-sm">${formData.monthly_electric_bill}</div>
          
          <div className="text-sm font-medium">Interested in Batteries:</div>
          <div className="text-sm">{formData.interested_in_batteries ? "Yes" : "No"}</div>
          
          {formData.interested_in_batteries && (
            <>
              <div className="text-sm font-medium">Battery Reason:</div>
              <div className="text-sm">{formatBatteryReason(formData.battery_reason)}</div>
            </>
          )}
          
          <div className="text-sm font-medium">Purchase Timeline:</div>
          <div className="text-sm">{formatPurchaseTimeline(formData.purchase_timeline)}</div>
          
          <div className="text-sm font-medium">Willing to Remove Trees:</div>
          <div className="text-sm">{formData.willing_to_remove_trees ? "Yes" : "No"}</div>
          
          <div className="text-sm font-medium">Roof Age Status:</div>
          <div className="text-sm">{formatRoofAge(formData.roof_age_status)}</div>
          
          <div className="text-sm font-medium">Name:</div>
          <div className="text-sm">{formData.first_name} {formData.last_name}</div>
          
          <div className="text-sm font-medium">Email:</div>
          <div className="text-sm">{formData.email}</div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        By submitting this form, you'll create an account where you can view and manage your solar quotes.
      </p>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>Processing...</>
          ) : (
            <>
              Submit <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
