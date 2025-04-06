
import { useState } from "react";
import { toast } from "sonner";
import { useQuestionnaireBase } from "./useQuestionnaireBase";

export const useQuestionnaireAttachments = () => {
  const { user, questionnaire, supabase } = useQuestionnaireBase();
  const [isUploading, setIsUploading] = useState(false);
  
  // Upload attachment for a questionnaire
  const uploadAttachment = async (file: File) => {
    if (!user || !questionnaire) {
      toast.error("You need to create a profile first");
      return null;
    }
    
    // Check file size limit (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds the 5MB limit");
      return null;
    }
    
    try {
      setIsUploading(true);
      console.log("Uploading attachment for questionnaire:", questionnaire.id);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const filePath = `${questionnaire.id}/${timestamp}-${file.name}`;
      
      // Upload file to storage
      const { data, error } = await supabase.storage
        .from('questionnaire_attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file");
        return null;
      }
      
      console.log("File uploaded successfully:", data.path);
      toast.success("File uploaded successfully");
      return data.path;
    } catch (error) {
      console.error("Error in uploadAttachment:", error);
      toast.error("An error occurred while uploading the file");
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Get attachments for a questionnaire
  const getAttachments = async () => {
    if (!user || !questionnaire) return [];
    
    try {
      console.log("Fetching attachments for questionnaire:", questionnaire.id);
      
      // List files in storage
      const { data, error } = await supabase.storage
        .from('questionnaire_attachments')
        .list(questionnaire.id);
      
      if (error) {
        console.error("Error listing files:", error);
        toast.error("Failed to load attachments");
        return [];
      }
      
      console.log("Fetched attachments:", data);
      return data;
    } catch (error) {
      console.error("Error in getAttachments:", error);
      toast.error("An error occurred while loading attachments");
      return [];
    }
  };
  
  // Delete attachment
  const deleteAttachment = async (fileName: string) => {
    if (!user || !questionnaire) return false;
    
    try {
      console.log("Deleting attachment:", fileName);
      
      // Remove file from storage
      const { error } = await supabase.storage
        .from('questionnaire_attachments')
        .remove([`${questionnaire.id}/${fileName}`]);
      
      if (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file");
        return false;
      }
      
      console.log("File deleted successfully");
      toast.success("File deleted successfully");
      return true;
    } catch (error) {
      console.error("Error in deleteAttachment:", error);
      toast.error("An error occurred while deleting the file");
      return false;
    }
  };
  
  // Get file URL for an attachment
  const getFileUrl = (fileName: string) => {
    if (!questionnaire) return null;
    
    try {
      // Build the URL
      const { data } = supabase.storage
        .from('questionnaire_attachments')
        .getPublicUrl(`${questionnaire.id}/${fileName}`);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error in getFileUrl:", error);
      return null;
    }
  };

  return { uploadAttachment, getAttachments, deleteAttachment, getFileUrl, isUploading };
};
