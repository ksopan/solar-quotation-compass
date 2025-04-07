
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Import all the section components
import { ProfileHeader } from "./ProfileHeader";
import { PropertyInfoSection } from "./PropertyInfoSection";
import { BatterySection } from "./BatterySection";
import { PropertyConstraintsSection } from "./PropertyConstraintsSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { DocumentsSection } from "./DocumentsSection";
import { ProfileFooter } from "./ProfileFooter";

// Import the refactored hooks
import { useQuestionnaireProfileState, useQuestionnaireProfileHandlers } from "./hooks";

export const QuestionnaireProfileContent: React.FC = () => {
  // Use local state to ensure component updates
  const [localIsEditing, setLocalIsEditing] = useState(false);
  
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
  
  // Debug current render state  
  useEffect(() => {
    console.log("🧩 QuestionnaireProfileContent rendering with isEditing:", isEditing);
    console.log("📄 Form data in content:", formData);
  }, [isEditing, formData]);
  
  // Update local state when global state changes
  useEffect(() => {
    console.log("🔄 isEditing changed in QuestionnaireProfileContent to:", isEditing);
    setLocalIsEditing(isEditing);
  }, [isEditing]);
  
  // Make sure to use the correct data source
  const displayData = localIsEditing ? formData : questionnaire;
  
  if (!displayData) {
    console.log("⚠️ No display data available");
    return <div>No data available</div>;
  }
  
  console.log("🔍 Current edit mode:", localIsEditing ? "EDITING" : "VIEW-ONLY");
  
  return (
    <Card className="w-full">
      <ProfileHeader 
        isEditing={localIsEditing} 
        onEdit={handleEdit} 
      />
      
      <CardContent className="space-y-6">
        <PropertyInfoSection 
          isEditing={localIsEditing} 
          data={displayData} 
          handleChange={handleChange} 
        />
        
        <BatterySection 
          isEditing={localIsEditing} 
          data={displayData} 
          handleChange={handleChange} 
        />
        
        <PropertyConstraintsSection 
          isEditing={localIsEditing} 
          data={displayData} 
          handleChange={handleChange} 
        />
        
        <ContactInfoSection 
          isEditing={localIsEditing} 
          data={displayData} 
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
        isEditing={localIsEditing}
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
