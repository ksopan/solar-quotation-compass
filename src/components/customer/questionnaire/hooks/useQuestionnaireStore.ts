
import { create } from 'zustand';
import { QuestionnaireData } from '@/hooks/useQuestionnaire';

interface QuestionnaireStore {
  // State
  isEditing: boolean;
  formData: Partial<QuestionnaireData> | null;
  questionnaire: QuestionnaireData | null;
  attachments: { name: string; size: number; id?: string }[];
  isLoadingFiles: boolean;
  isSaving: boolean;
  showSubmitButton: boolean;
  
  // Actions
  setIsEditing: (value: boolean) => void;
  setFormData: (data: Partial<QuestionnaireData> | null) => void;
  setQuestionnaire: (data: QuestionnaireData | null) => void;
  setAttachments: (files: { name: string; size: number; id?: string }[]) => void;
  setIsLoadingFiles: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  setShowSubmitButton: (value: boolean) => void;
  
  // Field updater
  updateFormField: <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => void;
}

const useQuestionnaireStore = create<QuestionnaireStore>((set) => ({
  // Initial state
  isEditing: false,
  formData: null,
  questionnaire: null,
  attachments: [],
  isLoadingFiles: false,
  isSaving: false,
  showSubmitButton: false,
  
  // Actions
  setIsEditing: (value) => {
    console.log(`🔄 Zustand: Setting isEditing to ${value}`);
    set({ isEditing: value });
  },
  
  setFormData: (data) => {
    console.log('🔄 Zustand: Setting formData', data);
    set({ formData: data ? { ...data } : null });
  },
  
  setQuestionnaire: (data) => {
    console.log('🔄 Zustand: Setting questionnaire', data);
    set({ questionnaire: data });
    
    // Update show submit button based on questionnaire completion status
    if (data) {
      set({ showSubmitButton: !data.is_completed });
    }
  },
  
  setAttachments: (files) => set({ attachments: [...files] }),
  
  setIsLoadingFiles: (value) => set({ isLoadingFiles: value }),
  
  setIsSaving: (value) => set({ isSaving: value }),
  
  setShowSubmitButton: (value) => set({ showSubmitButton: value }),
  
  // Field updater
  updateFormField: (field, value) => {
    console.log(`🔄 Zustand: Updating form field ${String(field)} to:`, value);
    set((state) => ({
      formData: state.formData ? { ...state.formData, [field]: value } : { [field]: value }
    }));
  }
}));

export default useQuestionnaireStore;
