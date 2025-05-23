
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth"; // Updated import path
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormFileUpload } from "./quotation-form/FormFileUpload";
import { RoofTypeSelector } from "./quotation-form/RoofTypeSelector";
import { QuotationMetrics } from "./quotation-form/QuotationMetrics";
import { useQuotationForm } from "./quotation-form/useQuotationForm";
import { toast } from "sonner";

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
  
  // Check authentication on component load
  useEffect(() => {
    if (!user) {
      console.warn("QuotationForm rendered without authenticated user");
      toast.warning("Please login to submit a quotation request");
    } else {
      console.log("QuotationForm rendered with user:", user.id, user.role);
      // Verify the user role
      if (user.role !== "customer") {
        console.warn(`User with role ${user.role} attempting to access customer form`);
        toast.warning("Only customers can submit quotation requests");
      }
    }
  }, [user]);

  const onSubmitWithValidation = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate user is logged in
    if (!user) {
      toast.error("You must be logged in to submit a quotation request");
      return;
    }
    
    // Validate user role
    if (user.role !== "customer") {
      toast.error("Only customers can submit quotation requests");
      return;
    }
    
    // Proceed with submission
    console.log("Attempting form submission with user:", user.id);
    handleSubmit(e);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Solar Panel Quotation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmitWithValidation} className="space-y-4">
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
          
          <Button type="submit" className="w-full" disabled={isSubmitting || !user || user.role !== "customer"}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
          
          {!user && (
            <p className="text-sm text-red-500 mt-2">You must be logged in as a customer to submit a request</p>
          )}
          
          {user && user.role !== "customer" && (
            <p className="text-sm text-red-500 mt-2">Only customers can submit quotation requests</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
