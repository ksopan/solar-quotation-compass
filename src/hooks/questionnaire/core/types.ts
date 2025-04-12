
import { QuestionnaireData } from "../useQuestionnaireBase";

/**
 * Type definition for the return value of the useQuestionnaire hook
 */
export interface QuestionnaireHookReturn {
  // Questionnaire data and status
  questionnaire: QuestionnaireData | null;
  loading: boolean;
  isSaving: boolean;
  isUploading: boolean;
  attachments: Array<{name: string; size: number; id?: string;}>;
  isLoadingFiles: boolean;
  
  // Actions
  updateQuestionnaire: (data: Partial<QuestionnaireData>) => Promise<boolean>;
  createQuestionnaire: (data: Omit<QuestionnaireData, 'id' | 'created_at' | 'is_completed'>) => Promise<any>;
  uploadAttachment: (file: File) => Promise<string | null>;
  deleteAttachment: (fileName: string) => Promise<boolean>;
  getFileUrl: (fileName: string) => string | null;
  
  // Allow direct state updates if needed
  setQuestionnaire: (questionnaire: QuestionnaireData | null) => void;
}
