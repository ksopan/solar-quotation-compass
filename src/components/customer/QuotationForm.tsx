import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormFileUpload } from "./quotation-form/FormFileUpload";
import { RoofTypeSelector } from "./quotation-form/RoofTypeSelector";
import { QuotationMetrics } from "./quotation-form/QuotationMetrics";
import { useQuotationForm } from "./quotation-form/useQuotationForm";

export type QuotationFormValues = {
  location: string;
  roofType: string;
  energyUsage: number;
  roofArea: number;
  additionalNotes: string;
  files: File[];
};

interface QuotationFormProps {
  onSuccess: () => void;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const {
    formData,
    isSubmitting,
    handleInputChange,
    handleRoofTypeChange,
    handleFileChange,
    removeFile,
    handleSubmit
  } = useQuotationForm({ user, onSuccess });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Solar Panel Quotation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Installation Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter your address"
              required
            />
          </div>
          
          <RoofTypeSelector 
            value={formData.roofType} 
            onChange={handleRoofTypeChange} 
          />
          
          <QuotationMetrics
            energyUsage={formData.energyUsage}
            roofArea={formData.roofArea}
            onEnergyUsageChange={handleInputChange}
            onRoofAreaChange={handleInputChange}
          />
          
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              placeholder="Any specific requirements or questions"
              rows={4}
            />
          </div>
          
          <FormFileUpload
            files={formData.files}
            onFileChange={handleFileChange}
            onRemoveFile={removeFile}
          />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
