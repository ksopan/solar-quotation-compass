
import { useState, useEffect } from "react";
import { useQuestionnaire, QuestionnaireData } from "@/hooks/useQuestionnaire";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useQuestionnaireProfileState = () => {
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
    if (questionnaire && !questionnaire.is_completed) {
      setShowSubmitButton(true);
    } else {
      setShowSubmitButton(false);
    }
  }, [questionnaire]);
  
  return {
    questionnaire,
    loading,
    isSaving,
    isUploading,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    attachments,
    setAttachments,
    isLoadingFiles,
    setIsLoadingFiles,
    showSubmitButton,
    setShowSubmitButton,
    updateQuestionnaire,
    createQuestionnaire,
    uploadAttachment,
    getAttachments,
    deleteAttachment,
    getFileUrl
  };
};

export const useQuestionnaireProfileHandlers = () => {
  const {
    questionnaire,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    attachments,
    setAttachments,
    isLoadingFiles,
    setIsLoadingFiles,
    updateQuestionnaire,
    createQuestionnaire,
    uploadAttachment,
    getAttachments,
    deleteAttachment
  } = useQuestionnaireProfileState();
  
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
  
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!questionnaire) return;
      await loadFiles();
    };
    
    fetchAttachments();
  }, [questionnaire]);
  
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
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      const newQuestionnaire = await createQuestionnaire(formData as any);
      success = !!newQuestionnaire;
    }
    
    if (success) {
      setIsEditing(false);
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
      
      toast.success("Your profile has been submitted successfully!");
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
  
  return {
    handleEdit,
    handleChange,
    handleSave,
    handleSubmitProfile,
    handleCancel,
    handleFileUpload,
    handleFileDelete,
    handleCreateProfile,
    loadFiles
  };
};
