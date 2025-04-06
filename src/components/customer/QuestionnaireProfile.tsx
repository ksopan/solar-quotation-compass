
import React, { useState, useEffect } from "react";
import { useQuestionnaire, QuestionnaireData } from "@/hooks/useQuestionnaire";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Import all the new components
import { ProfileHeader } from "./questionnaire/ProfileHeader";
import { PropertyInfoSection } from "./questionnaire/PropertyInfoSection";
import { BatterySection } from "./questionnaire/BatterySection";
import { PropertyConstraintsSection } from "./questionnaire/PropertyConstraintsSection";
import { ContactInfoSection } from "./questionnaire/ContactInfoSection";
import { DocumentsSection } from "./questionnaire/DocumentsSection";
import { ProfileFooter } from "./questionnaire/ProfileFooter";
import { EmptyProfile } from "./questionnaire/EmptyProfile";
import { LoadingProfile } from "./questionnaire/LoadingProfile";

export const QuestionnaireProfile: React.FC = () => {
  const { 
    questionnaire, 
    loading, 
    isSaving,
    isUploading,
    updateQuestionnaire, 
    createQuestionnaire,
    uploadAttachment,
    getAttachments,
    deleteAttachment,
    getFileUrl
  } = useQuestionnaire();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<QuestionnaireData> | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; size: number; id?: string }[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!questionnaire) return;
      
      try {
        const files = await getAttachments();
        setAttachments(files.map(file => ({
          name: file.name,
          size: file.metadata?.size || 0,
          id: file.id
        })));
      } catch (error) {
        console.error("Error fetching attachments:", error);
      }
    };
    
    fetchAttachments();
    
    // Show submit button if questionnaire exists but is not completed
    if (questionnaire && !questionnaire.is_completed) {
      setShowSubmitButton(true);
    } else {
      setShowSubmitButton(false);
    }
  }, [questionnaire, getAttachments]);
  
  const loadFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const files = await getAttachments();
      setAttachments(files.map(file => ({
        name: file.name,
        size: file.metadata?.size || 0,
        id: file.id
      })));
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };
  
  const handleEdit = () => {
    setFormData(questionnaire || {});
    setIsEditing(true);
  };
  
  const handleChange = (field: keyof QuestionnaireData, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : { [field]: value });
  };
  
  const handleSave = async () => {
    if (!formData) return;
    
    let success = false;
    
    if (questionnaire) {
      success = await updateQuestionnaire(formData);
    } else {
      const requiredFields = [
        'property_type', 'ownership_status', 'monthly_electric_bill',
        'interested_in_batteries', 'purchase_timeline', 'willing_to_remove_trees',
        'roof_age_status', 'first_name', 'last_name', 'email'
      ];
      
      const missingFields = requiredFields.filter(field => 
        !formData[field as keyof QuestionnaireData]
      );
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      const newQuestionnaire = await createQuestionnaire(formData as any);
      success = !!newQuestionnaire;
    }
    
    if (success) {
      setIsEditing(false);
      
      // Show submit button if not already submitted
      if (questionnaire && !questionnaire.is_completed) {
        setShowSubmitButton(true);
      }
    }
  };

  const handleSubmitProfile = async () => {
    if (!questionnaire) return;
    
    try {
      const { error } = await supabase
        .from("property_questionnaires")
        .update({ is_completed: true })
        .eq("id", questionnaire.id);
        
      if (error) {
        console.error("Error submitting profile:", error);
        toast.error("Failed to submit your profile");
        return;
      }
      
      // Update local state
      if (questionnaire) {
        setShowSubmitButton(false);
        toast.success("Your profile has been submitted successfully!");
      }
    } catch (error) {
      console.error("Error in handleSubmitProfile:", error);
      toast.error("An error occurred while submitting your profile");
    }
  };
  
  const handleCancel = () => {
    setFormData(questionnaire || {});
    setIsEditing(false);
  };
  
  const handleFileUpload = async (file: File) => {
    const path = await uploadAttachment(file);
    if (path) {
      await loadFiles();
    }
  };
  
  const handleFileDelete = async (fileName: string) => {
    const success = await deleteAttachment(fileName);
    if (success) {
      await loadFiles();
    }
  };
  
  const handleCreateProfile = () => {
    setFormData({
      property_type: "home",
      ownership_status: "own",
      monthly_electric_bill: 170,
      interested_in_batteries: false,
      battery_reason: null,
      purchase_timeline: "within_year",
      willing_to_remove_trees: false,
      roof_age_status: "no",
      first_name: "",
      last_name: "",
      email: ""
    });
    setIsEditing(true);
  };
  
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
