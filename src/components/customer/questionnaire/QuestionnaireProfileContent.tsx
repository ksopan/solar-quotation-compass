
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileSections } from "./ProfileSections";
import { ProfileFooter } from "./ProfileFooter";
import { LoadingProfile } from "./LoadingProfile";
import { EmptyProfile } from "./EmptyProfile";
import { useQuestionnaire } from "@/hooks/useQuestionnaire";

export const QuestionnaireProfileContent: React.FC = () => {
  // Use the refactored questionnaire hook
  const {
    questionnaire,
    loading,
    isSaving,
    updateQuestionnaire,
    createQuestionnaire
  } = useQuestionnaire();
  
  // Local state management
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState<any>(null);
  const [showSubmitButton, setShowSubmitButton] = React.useState(questionnaire?.is_completed === false);
  
  // Initialize formData when questionnaire changes
  React.useEffect(() => {
    if (questionnaire && !formData) {
      setFormData({...questionnaire});
    }
    
    // Set submit button visibility when questionnaire loads
    if (questionnaire) {
      setShowSubmitButton(questionnaire.is_completed === false);
    }
  }, [questionnaire, formData]);
  
  // Set up event listener for custom edit event
  React.useEffect(() => {
    const handleEditEvent = () => {
      console.log("🔥 Edit event received in QuestionnaireProfileContent");
      handleEdit();
    };
    
    document.addEventListener('questionnaire:edit', handleEditEvent);
    
    return () => {
      document.removeEventListener('questionnaire:edit', handleEditEvent);
    };
  }, [questionnaire]); // Re-add when questionnaire changes
  
  // Handler functions
  const handleEdit = () => {
    console.log("🔑 handleEdit called in QuestionnaireProfileContent");
    if (questionnaire) {
      setFormData({...questionnaire});
      setIsEditing(true);
    }
  };
  
  const handleChange = (field: any, value: any) => {
    console.log(`Field ${field} changing to:`, value);
    setFormData(prev => ({...prev, [field]: value}));
  };
  
  const handleSave = async () => {
    if (!formData) return;
    
    const success = await updateQuestionnaire(formData);
    if (success) {
      setIsEditing(false);
    }
  };
  
  const handleCancel = () => {
    if (questionnaire) {
      setFormData({...questionnaire});
    }
    setIsEditing(false);
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
  
  const handleSubmitProfile = async () => {
    if (!questionnaire) return;
    
    const success = await updateQuestionnaire({ 
      ...questionnaire, 
      is_completed: true 
    });
    
    if (success) {
      setShowSubmitButton(false);
    }
  };
  
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
      />
      
      <CardContent className="space-y-6">
        <ProfileSections 
          isEditing={isEditing}
          displayData={displayData}
          questionnaire={questionnaire}
          handleChange={handleChange}
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
