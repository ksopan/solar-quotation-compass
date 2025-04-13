
import { useMemo } from "react";
import { useQuestionnaireUpdate } from "./useQuestionnaireUpdate";
import { useQuestionnaireCreate } from "./useQuestionnaireCreate";
import { QuestionnaireData } from "./useQuestionnaireBase";

export const useQuestionnaireActions = (
  questionnaire: QuestionnaireData | null,
  setQuestionnaire: (questionnaire: QuestionnaireData | null) => void
) => {
  const { updateQuestionnaire, isSaving: isUpdating } = useQuestionnaireUpdate();
  const { createQuestionnaire, isSaving: isCreating } = useQuestionnaireCreate();
  
  // Enhanced update that also updates local state
  const updateLocalQuestionnaire = async (updatedData: Partial<QuestionnaireData>) => {
    const success = await updateQuestionnaire(questionnaire, updatedData);
    
    if (success && questionnaire) {
      // Update local state
      setQuestionnaire({ 
        ...questionnaire, 
        ...updatedData
      } as QuestionnaireData);
    }
    
    return success;
  };
  
  // Enhanced create that also updates local state
  const createLocalQuestionnaire = async (data: Partial<QuestionnaireData>) => {
    const newQuestionnaire = await createQuestionnaire(data);
    
    if (newQuestionnaire) {
      // Update local state
      setQuestionnaire(newQuestionnaire as QuestionnaireData);
    }
    
    return newQuestionnaire;
  };

  return useMemo(() => ({
    updateQuestionnaire: updateLocalQuestionnaire,
    createQuestionnaire: createLocalQuestionnaire,
    isSaving: isUpdating || isCreating
  }), [
    updateLocalQuestionnaire,
    createLocalQuestionnaire,
    isUpdating,
    isCreating
  ]);
};
