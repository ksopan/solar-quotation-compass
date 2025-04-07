
import React from "react";
import { PropertyInfoSection } from "./PropertyInfoSection";
import { BatterySection } from "./BatterySection";
import { PropertyConstraintsSection } from "./PropertyConstraintsSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { DocumentsSection } from "./DocumentsSection";
import { useProfile } from "./ProfileContextProvider";
import { QuestionnaireData } from "./types";

interface ProfileSectionsProps {
  isEditing: boolean;
  displayData: Partial<QuestionnaireData>;
  questionnaire: QuestionnaireData | null;
}

export const ProfileSections: React.FC<ProfileSectionsProps> = ({
  isEditing,
  displayData,
  questionnaire
}) => {
  const { 
    handleChange,
    handleFileUpload,
    handleFileDelete,
    getFileUrl,
    attachments,
    isLoadingFiles,
    isUploading
  } = useProfile();

  return (
    <>
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
    </>
  );
};
