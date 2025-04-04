
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
    
    // Handle numeric inputs
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

  const checkPermissions = async () => {
    // Check if the user has permission to insert into quotation_requests
    console.log("Testing database permissions...");
    try {
      // Verify session exists
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session retrieval error:", sessionError);
        return false;
      }
      if (!sessionData.session) {
        console.error("No active session");
        return false;
      }
      console.log("Active session found with user:", sessionData.session.user.id);
      
      // Check quotation_requests permission
      console.log("Checking quotation_requests permission...");
      const { error: testError } = await supabase
        .from("quotation_requests")
        .select("id")
        .limit(1);
      
      if (testError) {
        console.error("Permission test error:", testError);
        return false;
      }
      
      // Check storage bucket permission
      console.log("Checking storage bucket permission...");
      const { error: storageError } = await supabase
        .storage
        .from("quotation-files")
        .list('test-dir', { limit: 1 });
      
      if (storageError) {
        console.error("Storage test error:", storageError);
        return false;
      }
      
      console.log("All permissions verified");
      return true;
    } catch (error) {
      console.error("Permission check error:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a quotation request");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Run permission check first
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        throw new Error("You don't have permission to create quotations. Please check your account status.");
      }
      
      // Log the current auth status to help debug
      console.log("Submitting as user:", user.id);
      
      // Check if we have an active session first
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!sessionData.session) {
        console.error("No active session found");
        throw new Error("No active session found. Please log in again.");
      }
      
      console.log("Active session confirmed:", sessionData.session.user.id);
      
      // 1. Create the quotation request
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
      
      // 2. Upload files if any
      if (formData.files.length > 0) {
        console.log(`Uploading ${formData.files.length} files...`);
        
        for (const file of formData.files) {
          // Upload to Storage
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${user.id}/${quotation.id}/${fileName}`;
          
          console.log(`Uploading file ${file.name} to path ${filePath}`);
          
          const { error: uploadError } = await supabase.storage
            .from("quotation-files")
            .upload(filePath, file);
          
          if (uploadError) {
            console.error("File upload error:", uploadError);
            continue;
          }
          
          console.log(`File uploaded successfully to ${filePath}`);
          
          // Create document file entry
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
          } else {
            console.log("File record created successfully");
          }
        }
      }
      
      toast.success("Quotation request submitted successfully!");
      
      // Reset form
      setFormData({
        location: "",
        roofType: "asphalt",
        energyUsage: 0,
        roofArea: 0,
        additionalNotes: "",
        files: []
      });
      
      // Call the success callback
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
