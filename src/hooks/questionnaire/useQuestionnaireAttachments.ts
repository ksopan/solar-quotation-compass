
import { toast } from "sonner";
import { useQuestionnaireBase } from "./useQuestionnaireBase";

export const useQuestionnaireAttachments = () => {
  const { user, questionnaire, setIsSaving, supabase } = useQuestionnaireBase();
  
  // Upload questionnaire attachments
  const uploadAttachment = async (file: File) => {
    if (!user || !questionnaire) return null;
    
    try {
      setIsSaving(true);
      
      // Create a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      
      // Create a folder path with the user's ID and questionnaire ID
      const filePath = `${user.id}/${questionnaire.id}/${fileName}`;
      
      console.log(`Uploading file ${file.name} to path ${filePath}`);
      
      // Check if the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'questionnaire_attachments');
      
      if (!bucketExists) {
        console.error("Bucket 'questionnaire_attachments' doesn't exist");
        toast.error("Storage configuration error. Please contact support.");
        return null;
      }
      
      const { data, error } = await supabase.storage
        .from("questionnaire_attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });
      
      if (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file");
        return null;
      }
      
      console.log("File uploaded:", data);
      return data.path;
    } catch (error) {
      console.error("Error in uploadAttachment:", error);
      toast.error("An error occurred while uploading your file");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Get list of attachments
  const getAttachments = async () => {
    if (!user || !questionnaire) return [];
    
    try {
      // List files in the user's folder for this questionnaire
      const { data, error } = await supabase.storage
        .from("questionnaire_attachments")
        .list(`${user.id}/${questionnaire.id}`);
      
      if (error) {
        console.error("Error listing files:", error);
        toast.error("Failed to load attachments");
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in getAttachments:", error);
      toast.error("An error occurred while loading attachments");
      return [];
    }
  };

  // Delete an attachment
  const deleteAttachment = async (fileName: string) => {
    if (!user || !questionnaire) return false;
    
    try {
      setIsSaving(true);
      
      const filePath = `${user.id}/${questionnaire.id}/${fileName}`;
      
      const { error } = await supabase.storage
        .from("questionnaire_attachments")
        .remove([filePath]);
      
      if (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file");
        return false;
      }
      
      toast.success("File deleted successfully");
      return true;
    } catch (error) {
      console.error("Error in deleteAttachment:", error);
      toast.error("An error occurred while deleting your file");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Get a public URL for a file
  const getFileUrl = (fileName: string) => {
    if (!user || !questionnaire) return null;
    
    const { data } = supabase.storage
      .from("questionnaire_attachments")
      .getPublicUrl(`${user.id}/${questionnaire.id}/${fileName}`);
    
    return data.publicUrl;
  };

  return { uploadAttachment, getAttachments, deleteAttachment, getFileUrl };
};
