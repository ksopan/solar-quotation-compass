import React from "react";
import { ProfileProvider } from "./questionnaire/ProfileContextProvider";
import { QuestionnaireProfileContent } from "./questionnaire/QuestionnaireProfileContent";

// Main component that wraps everything with the context provider
export const QuestionnaireProfile: React.FC = () => {
  return (
    <ProfileProvider>
      <QuestionnaireProfileInner />
    </ProfileProvider>
  );
};

// Inner component that uses the context
const QuestionnaireProfileInner: React.FC = () => {
  return <QuestionnaireProfileContent />;
};

export default QuestionnaireProfile;