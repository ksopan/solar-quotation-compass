import React, { createContext, useReducer, useContext, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

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
}

// Define the state type
interface ProfileState {
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
type ProfileAction = 
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

// Create context
interface ProfileContextType extends ProfileState {
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

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Initial state
const initialState: ProfileState = {
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
function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
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

// Provider component
export const ProfileProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(profileReducer, initialState);
  
  // Fetch questionnaire data
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!user) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("property_questionnaires")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (error) {
          if (error.code === "PGRST116") {
            // No questionnaire found - this is not an error
            console.log("No questionnaire found for user");
            dispatch({ type: 'SET_QUESTIONNAIRE', payload: null });
          } else {
            console.error("Error fetching questionnaire:", error);
            toast.error("Failed to load your questionnaire data");
          }
        } else if (data) {
          console.log("Fetched questionnaire:", data);
          dispatch({ type: 'SET_QUESTIONNAIRE', payload: data as QuestionnaireData });
          dispatch({ type: 'SET_FORM_DATA', payload: {...data} });
          
          // Set submit button visibility
          if (data.is_completed === false) {
            dispatch({ type: 'SET_SHOW_SUBMIT_BUTTON', payload: true });
          }
        }
      } catch (error) {
        console.error("Error in fetchQuestionnaire:", error);
        toast.error("An error occurred while loading your questionnaire data");
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchQuestionnaire();
  }, [user]);
  
  // Fetch attachments 
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!state.questionnaire) return;
      
      try {
        dispatch({ type: 'SET_IS_LOADING_FILES', payload: true });
        const { data, error } = await supabase.storage
          .from('questionnaire_attachments')
          .list(state.questionnaire.id);
          
        if (error) {
          console.error("Error listing files:", error);
          dispatch({ type: 'SET_ATTACHMENTS', payload: [] });
        } else {
          dispatch({ type: 'SET_ATTACHMENTS', payload: data || [] });
        }
      } catch (error) {
        console.error("Error fetching attachments:", error);
        dispatch({ type: 'SET_ATTACHMENTS', payload: [] });
      } finally {
        dispatch({ type: 'SET_IS_LOADING_FILES', payload: false });
      }
    };
    
    fetchAttachments();
  }, [state.questionnaire]);

  // Handle editing
  const handleEdit = useCallback(() => {
    console.log("🔑 handleEdit called");
    if (state.questionnaire) {
      dispatch({ 
        type: 'EDIT_MODE', 
        payload: { questionnaire: state.questionnaire } 
      });
    } else {
      console.error("Cannot edit: questionnaire is null");
    }
  }, [state.questionnaire]);

  // Handle form field changes
  const handleChange = useCallback((field: keyof QuestionnaireData, value: any) => {
    console.log(`🔄 Updating form field ${String(field)} to:`, value);
    dispatch({ 
      type: 'UPDATE_FORM_FIELD', 
      payload: { field, value } 
    });
  }, []);

  // Handle saving changes
  const handleSave = useCallback(async () => {
    if (!state.formData || !state.questionnaire) return;
    
    try {
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      console.log("Updating questionnaire with:", state.formData);
      
      const { error } = await supabase
        .from("property_questionnaires")
        .update({
          ...state.formData,
          updated_at: new Date().toISOString()
        })
        .eq("id", state.questionnaire.id);
        
      if (error) {
        console.error("Error updating questionnaire:", error);
        toast.error("Failed to save your changes");
        return;
      }
      
      // Update the questionnaire with the form data
      dispatch({ type: 'SET_QUESTIONNAIRE', payload: state.formData as QuestionnaireData });
      // Exit edit mode
      dispatch({ type: 'SET_IS_EDITING', payload: false });
      
      toast.success("Profile saved successfully");
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("An error occurred while saving your changes");
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  }, [state.formData, state.questionnaire]);

  // Handle cancelling edits
  const handleCancel = useCallback(() => {
    console.log("❌ Cancelling edit mode");
    dispatch({ type: 'CANCEL_EDIT' });
  }, []);

  // Handle creating a new profile
  const handleCreateProfile = useCallback(() => {
    console.log("🆕 Creating new profile");
    dispatch({ 
      type: 'SET_FORM_DATA', 
      payload: {
        property_type: "home",
        ownership_status: "own",
        monthly_electric_bill: 170,
        interested_in_batteries: false,
        battery_reason: null,
        purchase_timeline: "within_year",
        willing_to_remove_trees: false,
        roof_age_status: "no",
        first_name: "",
        last_name: "",
        email: ""
      }
    });
    dispatch({ type: 'SET_IS_EDITING', payload: true });
  }, []);

  // Handle submitting profile
  const handleSubmitProfile = useCallback(async () => {
    if (!state.questionnaire) return;
    
    try {
      const { error } = await supabase
        .from("property_questionnaires")
        .update({ is_completed: true })
        .eq("id", state.questionnaire.id);
        
      if (error) {
        console.error("Error submitting profile:", error);
        toast.error("Failed to submit your profile");
        return;
      }
      
      // Update local state
      dispatch({ 
        type: 'SET_QUESTIONNAIRE', 
        payload: { ...state.questionnaire, is_completed: true } 
      });
      dispatch({ type: 'SET_SHOW_SUBMIT_BUTTON', payload: false });
      
      toast.success("Your profile has been submitted successfully!");
    } catch (error) {
      console.error("Error in handleSubmitProfile:", error);
      toast.error("An error occurred while submitting your profile");
    }
  }, [state.questionnaire]);

  // File upload handler
  const handleFileUpload = useCallback(async (file: File): Promise<string | null> => {
    if (!user || !state.questionnaire) {
      toast.error("Please save your profile first");
      return null;
    }

    try {
      dispatch({ type: 'SET_IS_UPLOADING', payload: true });
      const fileExt = file.name.split('.').pop();
      const timestamp = new Date().getTime();
      const filePath = `${state.questionnaire.id}/${timestamp}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('questionnaire_attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("❌ Error uploading file:", error);
        toast.error("Failed to upload file");
        return null;
      }

      // Update attachments after successful upload
      dispatch({ 
        type: 'SET_ATTACHMENTS', 
        payload: [
          ...state.attachments, 
          { name: `${timestamp}-${file.name}`, size: file.size }
        ] 
      });
      
      toast.success("File uploaded successfully");
      return data.path;
    } catch (error) {
      console.error("❌ Error in uploadAttachment:", error);
      toast.error("An error occurred while uploading the file");
      return null;
    } finally {
      dispatch({ type: 'SET_IS_UPLOADING', payload: false });
    }
  }, [user, state.questionnaire, state.attachments]);

  // File deletion handler
  const handleFileDelete = useCallback(async (fileName: string): Promise<boolean> => {
    if (!user || !state.questionnaire) return false;

    try {
      const filePath = `${state.questionnaire.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('questionnaire_attachments')
        .remove([filePath]);

      if (error) {
        console.error("❌ Error deleting file:", error);
        toast.error("Failed to delete file");
        return false;
      }

      // Update attachments after successful deletion
      dispatch({ 
        type: 'SET_ATTACHMENTS', 
        payload: state.attachments.filter(att => att.name !== fileName) 
      });
      toast.success("File deleted successfully");
      return true;
    } catch (error) {
      console.error("❌ Error in deleteAttachment:", error);
      toast.error("An error occurred while deleting the file");
      return false;
    }
  }, [user, state.questionnaire, state.attachments]);

  // Get file URL helper
  const getFileUrl = useCallback((fileName: string): string | null => {
    if (!state.questionnaire) return null;

    try {
      const { data } = supabase.storage
        .from('questionnaire_attachments')
        .getPublicUrl(`${state.questionnaire.id}/${fileName}`);
      return data.publicUrl;
    } catch (error) {
      console.error("Error in getFileUrl:", error);
      return null;
    }
  }, [state.questionnaire]);

  const value = {
    ...state,
    dispatch,
    handleEdit,
    handleChange,
    handleSave,
    handleCancel,
    handleCreateProfile,
    handleSubmitProfile,
    handleFileUpload,
    handleFileDelete,
    getFileUrl
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to use the profile context
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};