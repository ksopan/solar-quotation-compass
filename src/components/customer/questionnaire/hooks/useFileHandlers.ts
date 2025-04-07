
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QuestionnaireData } from '../types';

export const useFileHandlers = (
  user: any,
  state: {
    questionnaire: QuestionnaireData | null;
    attachments: Array<{name: string; size: number; id?: string;}>;
  },
  dispatch: React.Dispatch<any>
) => {
  // File upload handler
  const handleFileUpload = useCallback(async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error("Please log in to upload files");
      return null;
    }

    try {
      dispatch({ type: 'SET_IS_UPLOADING', payload: true });
      const timestamp = new Date().getTime();
      // Use user ID instead of questionnaire ID
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
      dispatch({ 
        type: 'SET_ATTACHMENTS', 
        payload: [
          ...state.attachments, 
          { name: `${timestamp}-${file.name}`, size: file.size }
        ] 
      });
      
      toast.success("File uploaded successfully");
      return data.path;
    } catch (error) {
      console.error("❌ Error in uploadAttachment:", error);
      toast.error("An error occurred while uploading the file");
      return null;
    } finally {
      dispatch({ type: 'SET_IS_UPLOADING', payload: false });
    }
  }, [user, state.attachments, dispatch]);

  // File deletion handler
  const handleFileDelete = useCallback(async (fileName: string): Promise<boolean> => {
    if (!user) return false;

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
      dispatch({ 
        type: 'SET_ATTACHMENTS', 
        payload: state.attachments.filter(att => att.name !== fileName) 
      });
      toast.success("File deleted successfully");
      return true;
    } catch (error) {
      console.error("❌ Error in deleteAttachment:", error);
      toast.error("An error occurred while deleting the file");
      return false;
    }
  }, [user, state.attachments, dispatch]);

  // Get file URL helper
  const getFileUrl = useCallback((fileName: string): string | null => {
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
  }, [user]);

  return {
    handleFileUpload,
    handleFileDelete,
    getFileUrl
  };
};
