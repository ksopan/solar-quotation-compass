import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuestionnaireStepIndicator } from "@/components/questionnaire/QuestionnaireStepIndicator";
import { AddressStep } from "@/components/questionnaire/steps/AddressStep";
import { RoofMaterialStep } from "@/components/questionnaire/steps/RoofMaterialStep";
import { HeatingTypeStep } from "@/components/questionnaire/steps/HeatingTypeStep";
import { ElectrificationInterestStep } from "@/components/questionnaire/steps/ElectrificationInterestStep";
import { ContactInfoStep } from "@/components/questionnaire/steps/ContactInfoStep";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormData {
  address: string;
  latitude: number;
  longitude: number;
  roof_material: string;
  heating_type: string;
  electrification_interest: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const GetFreeQuotes = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    address: "",
    latitude: 0,
    longitude: 0,
    roof_material: "",
    heating_type: "",
    electrification_interest: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: ""
  });

  const totalSteps = 5;

  const handleChange = (field: string, value: string | number) => {
    console.log(`📝 GetFreeQuotes handleChange CALLED - field: ${field}, value:`, value);
    console.log("📝 Current formData before update:", formData);
    try {
      setFormData(prev => {
        console.log("📝 Inside setFormData - prev:", prev);
        const updated = { ...prev, [field]: value };
        console.log("📝 Updated formData:", updated);
        return updated;
      });
      console.log("📝 setFormData completed successfully");
    } catch (error) {
      console.error("📝 Error in handleChange:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create questionnaire
      const { data: questionnaire, error: questionnaireError } = await supabase
        .from("property_questionnaires")
        .insert({
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          roof_material: formData.roof_material,
          heating_type: formData.heating_type,
          electrification_interest: formData.electrification_interest,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          status: "pending_verification",
          property_type: "home",
          ownership_status: "own",
          monthly_electric_bill: 0,
          interested_in_batteries: false,
          purchase_timeline: "within_year",
          willing_to_remove_trees: false,
          roof_age_status: "no"
        })
        .select()
        .single();

      if (questionnaireError) throw questionnaireError;

      // Send verification email
      const { error: emailError } = await supabase.functions.invoke(
        "send-verification-email",
        {
          body: {
            email: formData.email,
            firstName: formData.first_name,
            lastName: formData.last_name,
            verificationToken: questionnaire.verification_token
          }
        }
      );

      if (emailError) throw emailError;

      toast.success("Quote request submitted! Please check your email to verify.");
      setIsOpen(false);
      navigate("/");
    } catch (error: any) {
      console.error("Error submitting quote request:", error);
      toast.error(error.message || "Failed to submit quote request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) navigate("/");
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Get Free Solar Quotes</DialogTitle>
          <DialogDescription className="text-center">
            Answer a few questions to receive personalized quotes from top solar installers.
          </DialogDescription>
        </DialogHeader>

        <QuestionnaireStepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {currentStep === 1 && (
          <AddressStep
            address={formData.address}
            latitude={formData.latitude}
            longitude={formData.longitude}
            onChange={handleChange}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <RoofMaterialStep
            value={formData.roof_material}
            onChange={(value) => handleChange("roof_material", value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentStep === 3 && (
          <HeatingTypeStep
            value={formData.heating_type}
            onChange={(value) => handleChange("heating_type", value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentStep === 4 && (
          <ElectrificationInterestStep
            value={formData.electrification_interest}
            onChange={(value) => handleChange("electrification_interest", value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentStep === 5 && (
          <ContactInfoStep
            firstName={formData.first_name}
            lastName={formData.last_name}
            email={formData.email}
            phone={formData.phone}
            onChange={(field, value) => {
              console.log("🔵 ContactInfoStep onChange wrapper called:", field, value);
              handleChange(field, value);
              console.log("🔵 handleChange returned");
            }}
            onNext={handleSubmit}
            onPrevious={handlePrevious}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GetFreeQuotes;
