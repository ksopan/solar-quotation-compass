
import { useEffect } from "react";
import { useQuestionnaire } from "@/hooks/useQuestionnaire";
import useQuestionnaireStore from "./useQuestionnaireStore";

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
  
  // Get state from Zustand store
  const store = useQuestionnaireStore();
  
  // Debug state changes
  useEffect(() => {
    console.log("🔄 isEditing state changed in useQuestionnaireProfileState:", store.isEditing);
  }, [store.isEditing]);

  useEffect(() => {
    console.log("🔄 formData state changed:", store.formData);
  }, [store.formData]);
  
  // Update store when questionnaire changes
  useEffect(() => {
    if (questionnaire) {
      store.setQuestionnaire(questionnaire);
      
      // Only initialize form data if it hasn't been set yet
      if (store.formData === null) {
        console.log("🔄 Initializing form data with questionnaire data (initial)");
        store.setFormData({...questionnaire});
      }
    }
  }, [questionnaire, store]);
  
  return {
    questionnaire,
    loading: questionnaireLoading, 
    isSaving,
    isUploading,
    isEditing: store.isEditing,
    setIsEditing: store.setIsEditing,
    formData: store.formData,
    setFormData: store.setFormData,
    attachments: store.attachments,
    setAttachments: store.setAttachments,
    isLoadingFiles: store.isLoadingFiles,
    setIsLoadingFiles: store.setIsLoadingFiles,
    showSubmitButton: store.showSubmitButton,
    setShowSubmitButton: store.setShowSubmitButton,
    updateQuestionnaire,
    createQuestionnaire,
    uploadAttachment,
    deleteAttachment,
    getFileUrl
  };
};
