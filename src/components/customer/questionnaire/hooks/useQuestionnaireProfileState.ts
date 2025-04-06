
import { useState, useEffect } from "react";
import { useQuestionnaire, QuestionnaireData } from "@/hooks/useQuestionnaire";

export const useQuestionnaireProfileState = () => {
  const { 
    questionnaire, 
    loading, 
    isSaving,
    isUploading,
    updateQuestionnaire, 
    createQuestionnaire,
    uploadAttachment,
    getAttachments,
    deleteAttachment,
    getFileUrl
  } = useQuestionnaire();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<QuestionnaireData> | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; size: number; id?: string }[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  
  useEffect(() => {
    if (questionnaire && !questionnaire.is_completed) {
      setShowSubmitButton(true);
    } else {
      setShowSubmitButton(false);
    }
  }, [questionnaire]);
  
  return {
    questionnaire,
    loading,
    isSaving,
    isUploading,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    attachments,
    setAttachments,
    isLoadingFiles,
    setIsLoadingFiles,
    showSubmitButton,
    setShowSubmitButton,
    updateQuestionnaire,
    createQuestionnaire,
    uploadAttachment,
    getAttachments,
    deleteAttachment,
    getFileUrl
  };
};
