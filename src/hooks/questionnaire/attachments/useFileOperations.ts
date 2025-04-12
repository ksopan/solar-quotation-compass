
import { toast } from "sonner";
import { useBucketCheck } from "./useBucketCheck";
import { useUserFolder } from "./useUserFolder";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Attachment } from "./useAttachmentsState";

export const useFileOperations = (
  user: any,
  supabase: SupabaseClient,
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { checkBucketExists } = useBucketCheck(supabase);
  const { ensureUserFolder } = useUserFolder(supabase);
  
  // File upload handler
  const uploadAttachment = async (file: File) => {
    if (!user) {
      toast.error("You need to be logged in to upload files");
      return null;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds the 5MB limit");
      return null;
    }

    try {
      setIsUploading(true);
      console.log("🔄 Starting file upload for:", file.name);
      
      // Check if bucket exists
      const bucketExists = await checkBucketExists('questionnaire_attachments');
      if (!bucketExists) {
        return null;
      }
      
      // Ensure user folder exists
      await ensureUserFolder(user.id);
      
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}-${file.name}`;
      
      // Now upload the actual file
      console.log("📤 Uploading to path:", `${user.id}/${fileName}`);
      
      const { data, error } = await supabase.storage
        .from('questionnaire_attachments')
        .upload(`${user.id}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("❌ Error uploading file:", error);
        toast.error("Failed to upload file: " + error.message);
        return null;
      }

      toast.success("File uploaded successfully");
      console.log("📤 File uploaded successfully:", data.path);

      // Add the new file to our local state
      setAttachments(prev => [...prev, { 
        name: fileName, 
        size: file.size 
      }]);

      return data.path;
    } catch (error) {
      console.error("❌ Error in uploadAttachment:", error);
      toast.error("An error occurred while uploading the file");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Delete file handler
  const deleteAttachment = async (fileName: string) => {
    if (!user) return false;

    try {
      const filePath = `${user.id}/${fileName}`;
      console.log("🗑️ Deleting file at path:", filePath);

      const { error } = await supabase.storage
        .from('questionnaire_attachments')
        .remove([filePath]);

      if (error) {
        console.error("❌ Error deleting file:", error);
        toast.error("Failed to delete file: " + error.message);
        return false;
      }

      toast.success("File deleted successfully");
      setAttachments(prev => prev.filter(att => att.name !== fileName));
      return true;
    } catch (error) {
      console.error("❌ Error in deleteAttachment:", error);
      toast.error("An error occurred while deleting the file");
      return false;
    }
  };

  // Get file URL helper
  const getFileUrl = (fileName: string) => {
    if (!user) {
      console.warn("No user found when attempting to get file URL");
      return null;
    }

    try {
      const { data } = supabase.storage
        .from('questionnaire_attachments')
        .getPublicUrl(`${user.id}/${fileName}`);

      return data.publicUrl;
    } catch (error) {
      console.error("Unexpected error in getFileUrl:", error);
      return null;
    }
  };

  return {
    uploadAttachment,
    deleteAttachment,
    getFileUrl
  };
};
