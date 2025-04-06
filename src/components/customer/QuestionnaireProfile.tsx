
import React from "react";
import { Card } from "@/components/ui/card";

// Import all components now located in separate files
import { QuestionnaireProfileContent } from "./questionnaire/QuestionnaireProfileContent";
import { EmptyProfile } from "./questionnaire/EmptyProfile";
import { LoadingProfile } from "./questionnaire/LoadingProfile";

// Import the refactored hooks
import { useQuestionnaireProfileState, useQuestionnaireProfileHandlers } from "./questionnaire/hooks";

export const QuestionnaireProfile: React.FC = () => {
  // Make sure we're using all state correctly
  const {
    questionnaire,
    loading,
    isEditing,
    formData
  } = useQuestionnaireProfileState();
  
  const {
    handleCreateProfile
  } = useQuestionnaireProfileHandlers();
  
  console.log("QuestionnaireProfile rendering with isEditing:", isEditing);
  console.log("QuestionnaireProfile loading state:", loading);
  
  // Show loading state if data is being fetched
  if (loading) {
    console.log("Showing loading state, loading:", loading);
    return <LoadingProfile />;
  }
  
  // Show empty profile if no questionnaire and not in editing mode
  if (!questionnaire && !isEditing) {
    console.log("Showing empty profile");
    return <EmptyProfile handleCreateProfile={handleCreateProfile} />;
  }
  
  // Use the content component to display all sections when we have data
  console.log("Showing questionnaire content");
  return <QuestionnaireProfileContent />;
};

export default QuestionnaireProfile;
