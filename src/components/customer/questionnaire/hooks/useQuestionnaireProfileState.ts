
import { useState, useEffect } from "react";
import { useQuestionnaire, QuestionnaireData } from "@/hooks/useQuestionnaire";

export const useQuestionnaireProfileState = () => {
  const { 
    questionnaire, 
    loading: questionnaireLoading, 
    isSaving,
    isUploading,
    updateQuestionnaire, 
    createQuestionnaire,
    uploadAttachment,
    deleteAttachment,
    getFileUrl
  } = useQuestionnaire();
  
  // Create state variables with useState
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<QuestionnaireData> | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; size: number; id?: string }[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  
  // Debug state changes
  useEffect(() => {
    console.log("🔄 isEditing state changed:", isEditing);
  }, [isEditing]);

  useEffect(() => {
    console.log("🔄 formData state changed:", formData);
  }, [formData]);
  
  // Determine if we should show the submit button based on questionnaire completion status
  useEffect(() => {
    if (questionnaire && !questionnaire.is_completed) {
      setShowSubmitButton(true);
    } else {
      setShowSubmitButton(false);
    }
  }, [questionnaire]);

  // Update formData whenever editing starts
  useEffect(() => {
    if (isEditing && questionnaire) {
      console.log("🔄 Updating form data with questionnaire data because isEditing is true");
      setFormData(questionnaire);
    }
  }, [isEditing, questionnaire]);
  
  return {
    questionnaire,
    loading: questionnaireLoading, 
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
    deleteAttachment,
    getFileUrl
  };
};
