
// Define the questionnaire data type
export interface QuestionnaireData {
  id: string;
  property_type: string;
  ownership_status: string;
  monthly_electric_bill: number;
  interested_in_batteries: boolean;
  battery_reason: string | null;
  purchase_timeline: string;
  willing_to_remove_trees: boolean;
  roof_age_status: string;
  first_name: string;
  last_name: string;
  email: string;
  is_completed: boolean;
  created_at: string;
  status?: 'draft' | 'submitted' | 'under_review' | 'proposals_received' | 'completed' | 'cancelled';
  submitted_at?: string | null;
  proposal_deadline?: string | null;
  acceptance_deadline?: string | null;
  version?: number;
}

// Define the state type
export interface ProfileState {
  questionnaire: QuestionnaireData | null;
  formData: Partial<QuestionnaireData> | null;
  isEditing: boolean;
  loading: boolean;
  isSaving: boolean;
  isLoadingFiles: boolean;
  isUploading: boolean;
  showSubmitButton: boolean;
  attachments: Array<{name: string; size: number; id?: string;}>;
}

// Define actions
export type ProfileAction = 
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_QUESTIONNAIRE', payload: QuestionnaireData | null }
  | { type: 'SET_FORM_DATA', payload: Partial<QuestionnaireData> | null }
  | { type: 'SET_IS_EDITING', payload: boolean }
  | { type: 'EDIT_MODE', payload: { questionnaire: QuestionnaireData } }
  | { type: 'CANCEL_EDIT' }
  | { type: 'SET_IS_SAVING', payload: boolean }
  | { type: 'SET_ATTACHMENTS', payload: Array<{name: string; size: number; id?: string;}> }
  | { type: 'SET_IS_LOADING_FILES', payload: boolean }
  | { type: 'SET_IS_UPLOADING', payload: boolean }
  | { type: 'SET_SHOW_SUBMIT_BUTTON', payload: boolean }
  | { type: 'UPDATE_FORM_FIELD', payload: { field: keyof QuestionnaireData, value: any } };

// Create context type
export interface ProfileContextType extends ProfileState {
  dispatch: React.Dispatch<ProfileAction>;
  handleEdit: () => void;
  handleChange: (field: keyof QuestionnaireData, value: any) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  handleCreateProfile: () => void;
  handleSubmitProfile: () => Promise<void>;
  handleFileUpload: (file: File) => Promise<string | null>;
  handleFileDelete: (fileName: string) => Promise<boolean>;
  getFileUrl: (fileName: string) => string | null;
}
