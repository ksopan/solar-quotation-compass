import { useCallback } from "react";
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
import { toast } from "sonner";

export const useQuestionnaireFileHandlers = () => {
  const {
    user,
    questionnaire,
    setAttachments,
    isLoadingFiles,
    setIsLoadingFiles,
    attachments,
    setIsUploading,
    supabase
  } = useQuestionnaireProfileState();
  
  // Upload attachment for a questionnaire
  const uploadAttachment = useCallback(async (file: File) => {
    if (!user || !questionnaire) {
      toast.error("Please save your profile first");
      return null;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const filePath = `${questionnaire.id}/${timestamp}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('questionnaire_attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("❌ Error uploading file:", error);
        toast.error("Failed to upload file");
        return null;
      }

      // Update attachments after successful upload
      setAttachments(prev => [...prev, { 
        name: `${timestamp}-${file.name}`, 
        size: file.size 
      }]);
      
      toast.success("File uploaded successfully");
      return data.path;
    } catch (error) {
      console.error("❌ Error in uploadAttachment:", error);
      toast.error("An error occurred while uploading the file");
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user, questionnaire, setAttachments, setIsUploading, supabase]);

  // Delete attachment
  const deleteAttachment = useCallback(async (fileName: string) => {
    if (!user || !questionnaire) return false;

    try {
      const filePath = `${questionnaire.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('questionnaire_attachments')
        .remove([filePath]);

      if (error) {
        console.error("❌ Error deleting file:", error);
        toast.error("Failed to delete file");
        return false;
      }

      // Update attachments after successful deletion
      setAttachments(prev => prev.filter(att => att.name !== fileName));
      toast.success("File deleted successfully");
      return true;
    } catch (error) {
      console.error("❌ Error in deleteAttachment:", error);
      toast.error("An error occurred while deleting the file");
      return false;
    }
  }, [user, questionnaire, setAttachments, supabase]);

  // Load files - for initial load or refresh
  const loadFiles = useCallback(async () => {
    if (!questionnaire) {
      setAttachments([]);
      return;
    }
    
    try {
      setIsLoadingFiles(true);
      console.log("Loading files for questionnaire", questionnaire.id);
      
      const { data, error } = await supabase.storage
        .from('questionnaire_attachments')
        .list(questionnaire.id);
        
      if (error) {
        console.error("Error listing files:", error);
        toast.error("Failed to load your uploaded files");
        setAttachments([]);
      } else {
        setAttachments(data || []);
      }
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Failed to load your uploaded files");
      setAttachments([]);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [questionnaire, setAttachments, setIsLoadingFiles, supabase]);

  return {
    loadFiles,
    handleFileUpload: uploadAttachment,
    handleFileDelete: deleteAttachment,
    isLoadingFiles
  };
};