
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
      
      // Use user ID as the folder name instead of questionnaire ID for proper RLS
      const filePath = `${user.id}/${timestamp}-${file.name}`;

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
      // Use user ID instead of questionnaire ID
      const filePath = `${user.id}/${fileName}`;

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

  // Get file URL
  const getFileUrl = useCallback((fileName: string) => {
    if (!user) return null;

    try {
      const { data } = supabase.storage
        .from('questionnaire_attachments')
        .getPublicUrl(`${user.id}/${fileName}`);
      return data.publicUrl;
    } catch (error) {
      console.error("Error in getFileUrl:", error);
      return null;
    }
  }, [user, supabase]);

  // Load files - for initial load or refresh
  const loadFiles = useCallback(async () => {
    if (!user) {
      setAttachments([]);
      return;
    }
    
    try {
      setIsLoadingFiles(true);
      console.log("Loading files for user", user.id);
      
      const { data, error } = await supabase.storage
        .from('questionnaire_attachments')
        .list(user.id);
        
      if (error) {
        console.error("Error listing files:", error);
        toast.error("Failed to load your uploaded files");
        setAttachments([]);
      } else if (data) {
        // Convert the FileObject array to the expected format
        const formattedData = data.map(file => ({
          name: file.name,
          size: file.metadata?.size || 0,
          id: file.id
        }));
        setAttachments(formattedData);
      } else {
        setAttachments([]);
      }
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Failed to load your uploaded files");
      setAttachments([]);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [user, setAttachments, setIsLoadingFiles, supabase]);

  return {
    loadFiles,
    handleFileUpload: uploadAttachment,
    handleFileDelete: deleteAttachment,
    getFileUrl,
    isLoadingFiles
  };
};
