
import { useCallback } from "react";
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
import { toast } from "sonner";

export const useQuestionnaireFileHandlers = () => {
  const {
    questionnaire,
    setAttachments,
    uploadAttachment,
    deleteAttachment,
    attachments,
    setIsLoadingFiles
  } = useQuestionnaireProfileState();
  
  // Load files - Modified to work with existing attachments
  const loadFiles = useCallback(async () => {
    try {
      if (!questionnaire) {
        setAttachments([]);
        setIsLoadingFiles(false);
        return;
      }
      
      console.log("🔄 Loading files for questionnaire", questionnaire.id);
      // We don't need to call a separate function as attachments are already loaded 
      // in the useQuestionnaireAttachments hook and set in the state
      
    } catch (error) {
      console.error("❌ Error loading files:", error);
      toast.error("Failed to load your uploaded files");
      setAttachments([]);
    } finally {
      // Set loading to false after a short delay to ensure attachments are loaded
      setTimeout(() => {
        setIsLoadingFiles(false);
      }, 500);
    }
  }, [questionnaire, setAttachments, setIsLoadingFiles]);
  
  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    if (!questionnaire) {
      toast.error("Please create a profile first");
      return;
    }
    
    try {
      const result = await uploadAttachment(file);
      if (result) {
        toast.success("File uploaded successfully");
      }
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  }, [questionnaire, uploadAttachment]);
  
  // Handle file deletion
  const handleFileDelete = useCallback(async (fileName: string) => {
    try {
      const success = await deleteAttachment(fileName);
      if (success) {
        toast.success("File deleted successfully");
      }
    } catch (error) {
      console.error("❌ Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  }, [deleteAttachment]);
  
  return {
    loadFiles,
    handleFileUpload,
    handleFileDelete,
    attachments
  };
};
