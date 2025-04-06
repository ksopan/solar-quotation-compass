
import React from "react";
import { Card } from "@/components/ui/card";

// Import all components now located in separate files
import { QuestionnaireProfileContent } from "./questionnaire/QuestionnaireProfileContent";
import { EmptyProfile } from "./questionnaire/EmptyProfile";
import { LoadingProfile } from "./questionnaire/LoadingProfile";

// Import the refactored hooks
import { useQuestionnaireProfileState, useQuestionnaireProfileHandlers } from "./questionnaire/useQuestionnaireProfileHooks";

export const QuestionnaireProfile: React.FC = () => {
  const {
    questionnaire,
    loading,
    isEditing,
    formData
  } = useQuestionnaireProfileState();
  
  const {
    handleCreateProfile
  } = useQuestionnaireProfileHandlers();
  
  if (loading) {
    return <LoadingProfile />;
  }
  
  if (!questionnaire && !isEditing) {
    return <EmptyProfile handleCreateProfile={handleCreateProfile} />;
  }
  
  // Use the content component to display all sections when we have data
  return <QuestionnaireProfileContent />;
};

export default QuestionnaireProfile;
