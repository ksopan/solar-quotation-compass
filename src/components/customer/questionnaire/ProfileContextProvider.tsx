
import React, { createContext, useReducer, useContext } from "react";
import { useAuth } from "@/contexts/auth";
import { profileReducer, initialState } from "./profileReducer";
import { ProfileContextType } from "./types";
import { useQuestionnaireData } from "./hooks/useQuestionnaireData";
import { useQuestionnaireAttachmentsData } from "./hooks/useQuestionnaireAttachmentsData";
import { useProfileHandlers } from "./hooks/useProfileHandlers";
import { useFileHandlers } from "./hooks/useFileHandlers";
import { useQuestionnaireProfileHandlers } from "./hooks";

// Create context
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Provider component
export const ProfileProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(profileReducer, initialState);
  
  // Load questionnaire data
  useQuestionnaireData(user, dispatch);
  
  // Load attachments data
  useQuestionnaireAttachmentsData(state.questionnaire, dispatch);
  
  // Get profile handlers
  const profileHandlers = useProfileHandlers(user, state, dispatch);
  
  // Get file handlers
  const fileHandlers = useFileHandlers(user, state, dispatch);
  
  // Make sure we include all handlers in the context value
  const value: ProfileContextType = {
    ...state,
    dispatch,
    ...profileHandlers,
    ...fileHandlers
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
