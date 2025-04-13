import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuotationFormValues } from "@/components/customer/QuotationForm";
import { Database } from "@/integrations/supabase/types";
import { User } from "@/contexts/auth";

type QuotationInsert = Database['public']['Tables']['quotation_requests']['Insert'];
type DocumentFileInsert = Database['public']['Tables']['quotation_document_files']['Insert'];

interface UseQuotationFormProps {
  user: User | null;
  onSuccess: () => void;
}

export const useQuotationForm = ({ user, onSuccess }: UseQuotationFormProps) => {
  const [formData, setFormData] = useState<QuotationFormValues>({
    location: "",
    roofType: "asphalt",
    energyUsage: 0,
    roofArea: 0,
    additionalNotes: "",
    files: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "energyUsage" || name === "roofArea") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleRoofTypeChange = (value: string) => {
    setFormData({
      ...formData,
      roofType: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...fileList]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
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
    
    try {
      setIsSubmitting(true);
      
      console.log("Submitting as user:", user.id, "with role:", user.role);
      
      const quotationData: QuotationInsert = {
        customer_id: user.id,
        location: formData.location,
        roof_type: formData.roofType,
        energy_usage: formData.energyUsage || null,
        roof_area: formData.roofArea,
        additional_notes: formData.additionalNotes || null,
        status: "pending"
      };
      
      console.log("Submitting quotation data:", quotationData);
      
      const { data: quotation, error: quotationError } = await supabase
        .from("quotation_requests")
        .insert(quotationData)
        .select("id")
        .single();
      
      if (quotationError) {
        console.error("Full quotation error:", quotationError);
        throw new Error(`Error creating quotation: ${quotationError.message}`);
      }
      
      console.log("Quotation created successfully with ID:", quotation.id);
      
      if (formData.files.length > 0) {
        console.log(`Uploading ${formData.files.length} files...`);
        
        for (const file of formData.files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${user.id}/${quotation.id}/${fileName}`;
          
          console.log(`Uploading file ${file.name} to path ${filePath}`);
          
          const { error: uploadError } = await supabase.storage
            .from("quotation_document_files")
            .upload(filePath, file);
          
          if (uploadError) {
            console.error("File upload error:", uploadError);
            toast.error(`Error uploading file ${file.name}: ${uploadError.message}`);
            continue;
          }
          
          console.log(`File uploaded successfully to ${filePath}`);
          
          const fileData: DocumentFileInsert = {
            quotation_id: quotation.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size
          };
          
          const { error: fileRecordError } = await supabase
            .from("quotation_document_files")
            .insert(fileData);
          
          if (fileRecordError) {
            console.error("File record error:", fileRecordError);
            toast.error(`Error recording file metadata: ${fileRecordError.message}`);
          } else {
            console.log("File record created successfully");
          }
        }
      }
      
      toast.success("Quotation request submitted successfully!");
      
      setFormData({
        location: "",
        roofType: "asphalt",
        energyUsage: 0,
        roofArea: 0,
        additionalNotes: "",
        files: []
      });
      
      onSuccess();
      
    } catch (error) {
      console.error("Quotation submission error:", error);
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
