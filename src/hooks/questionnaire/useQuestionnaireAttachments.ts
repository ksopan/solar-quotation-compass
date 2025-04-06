import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuestionnaireBase } from "./useQuestionnaireBase";

export const useQuestionnaireAttachments = () => {
  const { user, questionnaire, supabase } = useQuestionnaireBase();
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // 🔁 Fetch attachments only once when questionnaire ID is available
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!user || !questionnaire?.id) return;

      try {
        setIsLoadingFiles(true);
        console.log("📂 Fetching attachments for questionnaire:", questionnaire.id);

        const { data, error } = await supabase.storage
          .from('questionnaire_attachments')
          .list(questionnaire.id);

        if (error) {
          console.error("❌ Error listing files:", error);
          toast.error("Failed to load attachments");
          setAttachments([]);
        } else {
          console.log("✅ Fetched attachments:", data);
          setAttachments(data || []);
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
  }, [user, questionnaire?.id, supabase]);

  // Upload attachment for a questionnaire
  const uploadAttachment = async (file: File) => {
    if (!user || !questionnaire) {
      toast.error("You need to create a profile first");
      return null;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds the 5MB limit");
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

      toast.success("File uploaded successfully");
      console.log("📤 File uploaded successfully:", data.path);

      // ✅ Refresh the attachments after upload
      setAttachments(prev => [...prev, { name: `${timestamp}-${file.name}` }]);

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

      toast.success("File deleted successfully");
      setAttachments(prev => prev.filter(att => att.name !== fileName));
      return true;
    } catch (error) {
      console.error("❌ Error in deleteAttachment:", error);
      toast.error("An error occurred while deleting the file");
      return false;
    }
  };

  // Get file URL
  const getFileUrl = (fileName: string) => {
    if (!questionnaire) return null;

    try {
      const { data } = supabase.storage
        .from('questionnaire_attachments')
        .getPublicUrl(`${questionnaire.id}/${fileName}`);
      return data.publicUrl;
    } catch (error) {
      console.error("Error in getFileUrl:", error);
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
