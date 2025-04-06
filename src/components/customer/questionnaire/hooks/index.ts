
import { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
import { useQuestionnaireFileHandlers } from "./useQuestionnaireFileHandlers";
import { useQuestionnaireFormHandlers } from "./useQuestionnaireFormHandlers";
import { useEffect } from "react";

export const useQuestionnaireProfileHandlers = () => {
  const fileHandlers = useQuestionnaireFileHandlers();
  const formHandlers = useQuestionnaireFormHandlers();
  
  const { questionnaire } = useQuestionnaireProfileState();
  const { loadFiles } = fileHandlers;
  
  // Use useEffect with proper dependencies to load files when questionnaire changes
  useEffect(() => {
    if (questionnaire) {
      loadFiles();
    }
  }, [questionnaire, loadFiles]);
  
  return {
    ...fileHandlers,
    ...formHandlers
  };
};

export { useQuestionnaireProfileState } from "./useQuestionnaireProfileState";
