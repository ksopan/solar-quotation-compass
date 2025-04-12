import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuestionnaireData } from "./useQuestionnaireBase";
import { useAuth } from "@/contexts/auth";
import { formatFileSize } from "@/lib/utils";

type Attachment = {
  name: string;
  size: number;
  id?: string;
};

export const useQuestionnaireAttachments = (questionnaire: QuestionnaireData | null) => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // 🔁 Fetch attachments when user ID changes
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!user) {
        setAttachments([]);
        return;
      }

      try {
        setIsLoadingFiles(true);
        console.log("📂 Fetching attachments for user:", user.id);

        const { data, error } = await supabase.storage
          .from('questionnaire_attachments')
          .list(user.id);

        if (error) {
          console.error("❌ Error listing files:", error);
          toast.error("Failed to load attachments");
          setAttachments([]);
        } else {
          console.log("✅ Fetched attachments:", data);
          // Transform FileObject into the expected format with the required size property
          const formattedData = data.map(file => ({
            name: file.name,
            size: file.metadata?.size || 0,
            id: file.id
          }));
          setAttachments(formattedData);
        }
      } catch (err) {
        console.error("❌ Error in getAttachments:", err);
        toast.error("An error occurred while loading attachments");
        setAttachments([]);
      } finally {
        setIsLoadingFiles(false);
      }
    };

    fetchAttachments();
  }, [user]);

  // Upload attachment for a questionnaire
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
      const timestamp = new Date().getTime();
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

      toast.success("File uploaded successfully");
      console.log("📤 File uploaded successfully:", data.path);

      // Add the new file to our local state
      setAttachments(prev => [...prev, { 
        name: `${timestamp}-${file.name}`, 
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

  // Delete attachment
  const deleteAttachment = async (fileName: string) => {
    if (!user) return false;

    try {
      const filePath = `${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('questionnaire_attachments')
        .remove([filePath]);

      if (error) {
        console.error("❌ Error deleting file:", error);
        toast.error("Failed to delete file");
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

  // Get file URL with improved error handling
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
    attachments,
    isLoadingFiles,
    isUploading,
    uploadAttachment,
    deleteAttachment,
    getFileUrl
  };
};
