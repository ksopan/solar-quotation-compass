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
import { LoadingProfile } from "./LoadingProfile";
import { EmptyProfile } from "./EmptyProfile";

// Import the context hook
import { useProfile } from "./ProfileContextProvider";

export const QuestionnaireProfileContent: React.FC = () => {
  // Use the profile context
  const {
    questionnaire,
    isEditing,
    formData,
    loading,
    isSaving,
    attachments,
    isLoadingFiles,
    isUploading,
    showSubmitButton,
    handleEdit,
    handleChange,
    handleSave,
    handleSubmitProfile,
    handleCancel,
    handleFileUpload,
    handleFileDelete,
    getFileUrl,
    handleCreateProfile
  } = useProfile();
  
  // Debug current render state  
  useEffect(() => {
    console.log("🧩 QuestionnaireProfileContent rendering with isEditing:", isEditing);
    console.log("📄 Form data in content:", formData);
  }, [isEditing, formData]);
  
  // Show loading state if data is being fetched
  if (loading) {
    console.log("Showing loading state");
    return <LoadingProfile />;
  }
  
  // Show empty profile if no questionnaire and not in editing mode
  if (!questionnaire && !isEditing) {
    console.log("Showing empty profile");
    return <EmptyProfile handleCreateProfile={handleCreateProfile} />;
  }
  
  // Make sure to use the correct data source
  const displayData = isEditing ? formData : questionnaire;
  
  if (!displayData) {
    console.log("⚠️ No display data available");
    return <div>No data available</div>;
  }
  
  console.log("🔍 Current edit mode:", isEditing ? "EDITING" : "VIEW-ONLY");
  
  return (
    <Card className="w-full">
      <ProfileHeader 
        isEditing={isEditing} 
        onEdit={handleEdit} 
      />
      
      <CardContent className="space-y-6">
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
    </Card>
  );
};