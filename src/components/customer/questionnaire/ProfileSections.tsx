
import React from "react";
import { PropertyInfoSection } from "./PropertyInfoSection";
import { BatterySection } from "./BatterySection";
import { PropertyConstraintsSection } from "./PropertyConstraintsSection";
import { ContactInfoSection } from "./ContactInfoSection";
import { DocumentsSection } from "./DocumentsSection";
import { useQuestionnaire } from "@/hooks/useQuestionnaire";
import { QuestionnaireData } from "@/hooks/questionnaire/useQuestionnaireBase";

interface ProfileSectionsProps {
  isEditing: boolean;
  displayData: Partial<QuestionnaireData>;
  questionnaire: QuestionnaireData | null;
  handleChange: (field: keyof QuestionnaireData, value: any) => void;
}

export const ProfileSections: React.FC<ProfileSectionsProps> = ({
  isEditing,
  displayData,
  questionnaire,
  handleChange
}) => {
  const { 
    uploadAttachment,
    deleteAttachment,
    getFileUrl,
    attachments,
    isLoadingFiles,
    isUploading
  } = useQuestionnaire();

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
        <div className="pt-4 mt-4 border-t border-border">
          <DocumentsSection 
            questionnaire={questionnaire}
            isLoadingFiles={isLoadingFiles}
            attachments={attachments || []}
            handleFileUpload={uploadAttachment}
            handleFileDelete={deleteAttachment}
            getFileUrl={getFileUrl}
            isUploading={isUploading}
            isEditing={isEditing}
          />
        </div>
      )}
    </>
  );
};
