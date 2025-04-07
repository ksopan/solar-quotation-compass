
import { ProfileState, ProfileAction } from './types';

// Initial state
export const initialState: ProfileState = {
  questionnaire: null,
  formData: null,
  isEditing: false,
  loading: true,
  isSaving: false,
  isLoadingFiles: false,
  isUploading: false,
  showSubmitButton: false,
  attachments: []
};

// Reducer function
export function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  console.log("ProfileReducer action:", action.type);
  
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_QUESTIONNAIRE':
      return { ...state, questionnaire: action.payload };
    case 'SET_FORM_DATA':
      return { ...state, formData: action.payload };
    case 'SET_IS_EDITING':
      return { ...state, isEditing: action.payload };
    case 'EDIT_MODE':
      // Atomic update for both form data and editing mode
      return { 
        ...state, 
        isEditing: true, 
        formData: {...action.payload.questionnaire}
      };
    case 'CANCEL_EDIT':
      return {
        ...state,
        isEditing: false,
        formData: state.questionnaire ? {...state.questionnaire} : null
      };
    case 'SET_IS_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_ATTACHMENTS':
      return { ...state, attachments: action.payload };
    case 'SET_IS_LOADING_FILES':
      return { ...state, isLoadingFiles: action.payload };
    case 'SET_IS_UPLOADING':
      return { ...state, isUploading: action.payload };
    case 'SET_SHOW_SUBMIT_BUTTON':
      return { ...state, showSubmitButton: action.payload };
    case 'UPDATE_FORM_FIELD':
      if (!state.formData) return state;
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.field]: action.payload.value
        }
      };
    default:
      return state;
  }
}
