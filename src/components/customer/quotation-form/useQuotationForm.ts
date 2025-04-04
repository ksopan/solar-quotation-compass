
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuotationFormValues } from "@/components/customer/QuotationForm";
import { Database } from "@/integrations/supabase/types";
import { User } from "@/contexts/AuthContext"; // Using our custom User type

type QuotationInsert = Database['public']['Tables']['quotation_requests']['Insert'];
type DocumentFileInsert = Database['public']['Tables']['quotation_document_files']['Insert'];

interface UseQuotationFormProps {
  user: User | null;
  onSuccess: () => void;
}

export const useQuotationForm = ({ user, onSuccess }: UseQuotationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuotationFormValues>({
    location: "",
    roofType: "flat",
    energyUsage: 0,
    roofArea: 0,
    additionalNotes: "",
    files: []
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === "energyUsage" || name === "roofArea") {
      const numericValue = value === "" ? 0 : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleRoofTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, roofType: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, files: [...prev.files, ...filesArray] }));
    }
  };
  
  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a quotation request");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Create the quotation request
      const quotationData: QuotationInsert = {
        customer_id: user.id,
        location: formData.location,
        roof_type: formData.roofType,
        energy_usage: formData.energyUsage,
        roof_area: formData.roofArea,
        additional_notes: formData.additionalNotes,
        status: "pending"
      };
      
      const { data: quotation, error: quotationError } = await supabase
        .from("quotation_requests")
        .insert(quotationData)
        .select()
        .single();
      
      if (quotationError) {
        throw new Error(`Error creating quotation: ${quotationError.message}`);
      }
      
      if (!quotation) {
        throw new Error("Failed to create quotation request");
      }
      
      // 2. Upload any attached files
      if (formData.files.length > 0) {
        const uploadPromises = formData.files.map(async (file) => {
          const filePath = `${quotation.id}/${file.name}`;
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from("quotation_documents")
            .upload(filePath, file);
          
          if (uploadError) {
            throw new Error(`Error uploading file: ${uploadError.message}`);
          }
          
          // Get public URL
          const { data: publicURL } = supabase.storage
            .from("quotation_documents")
            .getPublicUrl(filePath);
          
          // Record file in database
          const fileData: DocumentFileInsert = {
            quotation_id: quotation.id,
            file_path: publicURL.publicUrl,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size
          };
          
          const { error: fileRecordError } = await supabase
            .from("quotation_document_files")
            .insert(fileData);
          
          if (fileRecordError) {
            throw new Error(`Error recording file: ${fileRecordError.message}`);
          }
        });
        
        await Promise.all(uploadPromises);
      }
      
      toast.success("Quotation request submitted successfully");
      setFormData({
        location: "",
        roofType: "flat",
        energyUsage: 0,
        roofArea: 0,
        additionalNotes: "",
        files: []
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting quotation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit quotation request");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    formData,
    isSubmitting,
    handleInputChange,
    handleRoofTypeChange,
    handleFileChange,
    removeFile,
    handleSubmit
  };
};
