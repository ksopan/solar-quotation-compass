
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
import { useQuestionnaireFileHandlers } from "./useQuestionnaireFileHandlers";
import { useQuestionnaireFormHandlers } from "./useQuestionnaireFormHandlers";
import { useEffect } from "react";

export const useQuestionnaireProfileHandlers = () => {
  const fileHandlers = useQuestionnaireFileHandlers();
  const formHandlers = useQuestionnaireFormHandlers();
  
  const { questionnaire, setIsLoadingFiles } = useQuestionnaireProfileState();
  const { loadFiles } = fileHandlers;
  
  // Use useEffect with proper dependencies to load files when questionnaire changes
  useEffect(() => {
    if (questionnaire) {
      // Set loading flag for files only when specifically loading files
      setIsLoadingFiles(true);
      loadFiles();
    }
  }, [questionnaire, loadFiles, setIsLoadingFiles]);
  
  return {
    ...fileHandlers,
    ...formHandlers
  };
};

export { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
