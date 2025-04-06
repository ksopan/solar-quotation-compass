
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionnaireData } from "@/hooks/useQuestionnaire";

// Import all the refactored components
import { ProfileHeader } from "./questionnaire/ProfileHeader";
import { PropertyInfoSection } from "./questionnaire/PropertyInfoSection";
import { BatterySection } from "./questionnaire/BatterySection";
import { PropertyConstraintsSection } from "./questionnaire/PropertyConstraintsSection";
import { ContactInfoSection } from "./questionnaire/ContactInfoSection";
import { DocumentsSection } from "./questionnaire/DocumentsSection";
import { ProfileFooter } from "./questionnaire/ProfileFooter";
import { EmptyProfile } from "./questionnaire/EmptyProfile";
import { LoadingProfile } from "./questionnaire/LoadingProfile";

// Import the refactored hooks
import { useQuestionnaireProfileState, useQuestionnaireProfileHandlers } from "./questionnaire/useQuestionnaireProfileHooks";

export const QuestionnaireProfile: React.FC = () => {
  const {
    questionnaire,
    loading,
    isEditing,
    formData,
    isSaving,
    attachments,
    isLoadingFiles,
    isUploading,
    showSubmitButton,
    getFileUrl
  } = useQuestionnaireProfileState();
  
  const {
    handleEdit,
    handleChange,
    handleSave,
    handleSubmitProfile,
    handleCancel,
    handleFileUpload,
    handleFileDelete,
    handleCreateProfile
  } = useQuestionnaireProfileHandlers();
  
  if (loading) {
    return <LoadingProfile />;
  }
  
  if (!questionnaire && !isEditing) {
    return <EmptyProfile handleCreateProfile={handleCreateProfile} />;
  }
  
  const data = isEditing ? formData : questionnaire;
  
  return (
    <Card className="w-full">
      <ProfileHeader isEditing={isEditing} onEdit={handleEdit} />
      
      <CardContent className="space-y-6">
        <PropertyInfoSection 
          isEditing={isEditing} 
          data={data} 
          handleChange={handleChange} 
        />
        
        <BatterySection 
          isEditing={isEditing} 
          data={data} 
          handleChange={handleChange} 
        />
        
        <PropertyConstraintsSection 
          isEditing={isEditing} 
          data={data} 
          handleChange={handleChange} 
        />
        
        <ContactInfoSection 
          isEditing={isEditing} 
          data={data} 
          handleChange={handleChange} 
        />
        
        {questionnaire && (
          <DocumentsSection 
            questionnaire={questionnaire}
            isLoadingFiles={isLoadingFiles}
            attachments={attachments}
            handleFileUpload={handleFileUpload}
            handleFileDelete={handleFileDelete}
            getFileUrl={getFileUrl}
            isUploading={isUploading}
          />
        )}
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

export default QuestionnaireProfile;
