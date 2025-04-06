
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

// Import all the section components
import { ProfileHeader } from "./ProfileHeader";
import { PropertyInfoSection } from "./PropertyInfoSection";
import { BatterySection } from "./BatterySection";
import { PropertyConstraintsSection } from "./PropertyConstraintsSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { DocumentsSection } from "./DocumentsSection";
import { ProfileFooter } from "./ProfileFooter";

// Import the hooks
import { useQuestionnaireProfileState, useQuestionnaireProfileHandlers } from "./useQuestionnaireProfileHooks";

export const QuestionnaireProfileContent: React.FC = () => {
  const {
    questionnaire,
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
    handleFileDelete
  } = useQuestionnaireProfileHandlers();
  
  // Data source is either form data (when editing) or the questionnaire data
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
