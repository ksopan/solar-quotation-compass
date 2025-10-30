import { useState, useEffect } from "react";
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
          .from('quotation_document_files')
          .list(user.id);

        if (error) {
          console.error("❌ Error listing files:", error);
          toast.error("Failed to load attachments");
          setAttachments([]);
        } else {
          console.log("✅ Fetched attachments:", data);
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
      
      const timestamp = new Date().getTime();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${timestamp}-${safeFileName}`;

      console.log("📤 Uploading to path:", filePath);
      
      const { data, error } = await supabase.storage
        .from('quotation_document_files')
        .upload(filePath, file, {
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

      setAttachments(prev => [...prev, { 
        name: `${timestamp}-${safeFileName}`, 
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

  const deleteAttachment = async (fileName: string) => {
    if (!user) return false;

    try {
      const filePath = `${user.id}/${fileName}`;
      console.log("🗑️ Attempting to delete file at path:", filePath);

      const { error, data } = await supabase.storage
        .from('quotation_document_files')
        .remove([filePath]);

      if (error) {
        console.error("❌ Storage deletion error:", error);
        toast.error("Failed to delete file: " + error.message);
        return false;
      }

      console.log("✅ File deleted successfully from storage:", data);
      toast.success("File deleted successfully");
      
      // Update local state to remove the file
      setAttachments(prev => {
        const updated = prev.filter(att => att.name !== fileName);
        console.log("📋 Updated attachments list:", updated);
        return updated;
      });
      
      return true;
    } catch (error) {
      console.error("❌ Unexpected error in deleteAttachment:", error);
      toast.error("An error occurred while deleting the file");
      return false;
    }
  };

  const getFileUrl = (fileName: string) => {
    if (!user) {
      console.warn("No user found when attempting to get file URL");
      return null;
    }

    try {
      const { data } = supabase.storage
        .from('quotation_document_files')
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
