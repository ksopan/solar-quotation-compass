
import { useCallback } from 'react';
import { QuestionnaireData } from '../types';
import { useEditMode } from './useEditMode';
import { useFormChange } from './useFormChange';
import { useSaveHandler } from './useSaveHandler';
import { useSubmitHandler } from './useSubmitHandler';

/**
 * Main hook that combines all questionnaire profile handlers
 */
export const useProfileHandlers = (
  user: any,
  state: {
    questionnaire: QuestionnaireData | null;
    formData: Partial<QuestionnaireData> | null;
    attachments: Array<{name: string; size: number; id?: string;}>;
  },
  dispatch: React.Dispatch<any>
) => {
  // Get edit mode handlers
  const { 
    handleEdit, 
    handleCancel, 
    handleCreateProfile 
  } = useEditMode(
    state.questionnaire, 
    (formData) => dispatch({ type: 'SET_FORM_DATA', payload: formData }), 
    (isEditing) => dispatch({ type: 'SET_IS_EDITING', payload: isEditing })
  );

  // Get form change handler
  const { handleChange } = useFormChange(dispatch);

  // Get save handler
  const { handleSave } = useSaveHandler(user, state.questionnaire, state.formData, dispatch);

  // Get submit handler
  const { handleSubmitProfile } = useSubmitHandler(state.questionnaire, dispatch);

  return {
    handleEdit,
    handleChange,
    handleSave,
    handleCancel,
    handleCreateProfile,
    handleSubmitProfile
  };
};
