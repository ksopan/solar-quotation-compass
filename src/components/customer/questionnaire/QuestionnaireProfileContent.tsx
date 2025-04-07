
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Import all the section components
import { ProfileHeader } from "./ProfileHeader";
import { PropertyInfoSection } from "./PropertyInfoSection";
import { BatterySection } from "./BatterySection";
import { PropertyConstraintsSection } from "./PropertyConstraintsSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { DocumentsSection } from "./DocumentsSection";
import { ProfileFooter } from "./ProfileFooter";

// Import the refactored hooks and store
import { useQuestionnaireProfileHandlers } from "./hooks";
import useQuestionnaireStore from "./hooks/useQuestionnaireStore";

export const QuestionnaireProfileContent: React.FC = () => {
  // Get values from Zustand store
  const {
    questionnaire,
    isEditing,
    formData,
    isSaving,
    attachments,
    isLoadingFiles,
    showSubmitButton
  } = useQuestionnaireStore();
  
  // Get handlers
  const {
    handleEdit,
    handleChange,
    handleSave,
    handleSubmitProfile,
    handleCancel,
    handleFileUpload,
    handleFileDelete,
    getFileUrl,
    isUploading
  } = useQuestionnaireProfileHandlers();
  
  // Debug current render state  
  console.log("🧩 QuestionnaireProfileContent rendering with isEditing:", isEditing);
  console.log("📄 Form data in content:", formData);
  
  // Force a re-render when isEditing changes to ensure UI updates
  useEffect(() => {
    console.log("🔄 isEditing changed in QuestionnaireProfileContent to:", isEditing);
  }, [isEditing]);
  
  // Make sure to use the correct data source
  const displayData = isEditing ? formData : questionnaire;
  
  if (!displayData) {
    console.log("⚠️ No display data available");
    return <div>No data available</div>;
  }
  
  console.log("🔍 Current edit mode:", isEditing ? "EDITING" : "VIEW-ONLY");
  
  return (
    <Card className="w-full relative">
      <div className={isEditing ? "relative z-10" : ""}>
        <ProfileHeader onEdit={handleEdit} />
        
        <CardContent className="space-y-6">
          {/* Render all sections with explicit isEditing prop */}
          <PropertyInfoSection 
            isEditing={isEditing} 
            data={displayData} 
            handleChange={handleChange} 
          />
          
          <BatterySection 
            isEditing={isEditing} 
            data={displayData} 
            handleChange={handleChange} 
          />
          
          <PropertyConstraintsSection 
            isEditing={isEditing} 
            data={displayData} 
            handleChange={handleChange} 
          />
          
          <ContactInfoSection 
            isEditing={isEditing} 
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
          isEditing={isEditing}
          isSaving={isSaving}
          showSubmitButton={showSubmitButton}
          questionnaire={questionnaire}
          handleCancel={handleCancel}
          handleSave={handleSave}
          handleSubmitProfile={handleSubmitProfile}
        />
      </div>
      
      {/* Debug indicator to show editing state */}
      {isEditing && (
        <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs rounded m-1">
          Editing Mode
        </div>
      )}
    </Card>
  );
};
