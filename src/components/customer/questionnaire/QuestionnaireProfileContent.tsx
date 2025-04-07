
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileSections } from "./ProfileSections";
import { ProfileFooter } from "./ProfileFooter";
import { LoadingProfile } from "./LoadingProfile";
import { EmptyProfile } from "./EmptyProfile";
import { useProfile } from "./ProfileContextProvider";

export const QuestionnaireProfileContent: React.FC = () => {
  // Use the profile context
  const {
    questionnaire,
    isEditing,
    formData,
    loading,
    isSaving,
    showSubmitButton,
    handleEdit,
    handleSave,
    handleSubmitProfile,
    handleCancel,
    handleCreateProfile
  } = useProfile();
  
  // Show loading state if data is being fetched
  if (loading) {
    return <LoadingProfile />;
  }
  
  // Show empty profile if no questionnaire and not in editing mode
  if (!questionnaire && !isEditing) {
    return <EmptyProfile handleCreateProfile={handleCreateProfile} />;
  }
  
  // Make sure to use the correct data source
  const displayData = isEditing ? formData : questionnaire;
  
  if (!displayData) {
    return <div>No data available</div>;
  }
  
  return (
    <Card className="w-full">
      <ProfileHeader 
        isEditing={isEditing} 
        onEdit={handleEdit} 
      />
      
      <CardContent className="space-y-6">
        <ProfileSections 
          isEditing={isEditing}
          displayData={displayData}
          questionnaire={questionnaire}
        />
      </CardContent>
      
      <ProfileFooter 
        isEditing={isEditing}
        isSaving={isSaving}
        showSubmitButton={showSubmitButton}
        questionnaire={questionnaire}
        handleCancel={handleCancel}
        handleSave={handleSave}
        handleSubmitProfile={handleSubmitProfile}
      />
    </Card>
  );
};
