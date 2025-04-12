
import { QuestionnaireData } from "./useQuestionnaireBase";
import { useAttachmentsState, type Attachment } from "./attachments/useAttachmentsState";
import { useAttachmentsFetch } from "./attachments/useAttachmentsFetch";
import { useFileOperations } from "./attachments/useFileOperations";

export const useQuestionnaireAttachments = (questionnaire: QuestionnaireData | null) => {
  const {
    user,
    attachments,
    setAttachments,
    isUploading,
    setIsUploading,
    isLoadingFiles,
    setIsLoadingFiles,
    supabase
  } = useAttachmentsState();

  // Set up data fetching
  useAttachmentsFetch(user, supabase, setAttachments, setIsLoadingFiles);

  // Set up file operations
  const { uploadAttachment, deleteAttachment, getFileUrl } = useFileOperations(
    user,
    supabase,
    setAttachments,
    setIsUploading
  );

  return {
    attachments,
    isLoadingFiles,
    isUploading,
    uploadAttachment,
    deleteAttachment,
    getFileUrl
  };
};

// Re-export the Attachment type for use in other files
export type { Attachment } from "./attachments/useAttachmentsState";
