
import { useCallback } from 'react';
import { QuestionnaireData } from '../types';

/**
 * Hook for handling form field changes
 */
export const useFormChange = (
  dispatch: React.Dispatch<any>
) => {
  // Handle form field changes
  const handleChange = useCallback((field: keyof QuestionnaireData, value: any) => {
    console.log(`🔄 Updating form field ${String(field)} to:`, value);
    dispatch({ 
      type: 'UPDATE_FORM_FIELD', 
      payload: { field, value } 
    });
  }, [dispatch]);

  return {
    handleChange
  };
};
