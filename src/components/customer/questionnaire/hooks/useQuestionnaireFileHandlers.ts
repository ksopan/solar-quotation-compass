
import { useCallback } from "react";
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";

export const useQuestionnaireFileHandlers = () => {
  const {
    questionnaire,
    setAttachments,
    setIsLoadingFiles,
    getAttachments,
    uploadAttachment,
    deleteAttachment
  } = useQuestionnaireProfileState();
  
  // Use useCallback to stabilize loadFiles function
  const loadFiles = useCallback(async () => {
    if (!questionnaire) return;
    
    setIsLoadingFiles(true);
    try {
      const files = await getAttachments();
      setAttachments(files.map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        id: file.id
      })));
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [questionnaire, getAttachments, setAttachments, setIsLoadingFiles]);
  
  const handleFileUpload = async (file: File) => {
    const path = await uploadAttachment(file);
    if (path) {
      await loadFiles();
    }
  };
  
  const handleFileDelete = async (fileName: string) => {
    const success = await deleteAttachment(fileName);
    if (success) {
      await loadFiles();
    }
  };
  
  return {
    loadFiles,
    handleFileUpload,
    handleFileDelete
  };
};
