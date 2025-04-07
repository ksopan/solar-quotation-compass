import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export interface QuestionnaireData {
  id: string;
  property_type: string;
  ownership_status: string;
  monthly_electric_bill: number;
  interested_in_batteries: boolean;
  battery_reason: string | null;
  purchase_timeline: string;
  willing_to_remove_trees: boolean;
  roof_age_status: string;
  first_name: string;
  last_name: string;
  email: string;
  is_completed: boolean;
  created_at: string;
}

export const useQuestionnaireProfileState = () => {
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Keep editing state in this top-level hook
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<QuestionnaireData> | null>(null);
  const [attachments, setAttachments] = useState<{ name: string; size: number; id?: string }[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Debug state changes
  useEffect(() => {
    console.log("🔄 isEditing state changed in useQuestionnaireProfileState:", isEditing);
  }, [isEditing]);

  useEffect(() => {
    console.log("🔄 formData state changed:", formData);
  }, [formData]);
  
  // Fetch questionnaire data
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("property_questionnaires")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (error) {
          if (error.code === "PGRST116") {
            // No questionnaire found - this is not an error
            console.log("No questionnaire found for user");
            setQuestionnaire(null);
          } else {
            console.error("Error fetching questionnaire:", error);
            toast.error("Failed to load your questionnaire data");
          }
        } else if (data) {
          console.log("Fetched questionnaire:", data);
          setQuestionnaire(data as QuestionnaireData);
          // Initialize form data with questionnaire data
          setFormData({...data});
        }
      } catch (error) {
        console.error("Error in fetchQuestionnaire:", error);
        toast.error("An error occurred while loading your questionnaire data");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [user]);
  
  // Determine if we should show the submit button based on questionnaire completion status
  useEffect(() => {
    if (questionnaire && !questionnaire.is_completed) {
      setShowSubmitButton(true);
    } else {
      setShowSubmitButton(false);
    }
  }, [questionnaire]);
  
  // Fetch attachments when questionnaire changes
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!questionnaire) return;
      
      try {
        setIsLoadingFiles(true);
        const { data, error } = await supabase.storage
          .from('questionnaire_attachments')
          .list(questionnaire.id);
          
        if (error) {
          console.error("Error listing files:", error);
          setAttachments([]);
        } else {
          setAttachments(data || []);
        }
      } catch (error) {
        console.error("Error fetching attachments:", error);
        setAttachments([]);
      } finally {
        setIsLoadingFiles(false);
      }
    };
    
    fetchAttachments();
  }, [questionnaire]);

  // File URL helper function
  const getFileUrl = (fileName: string) => {
    if (!questionnaire) return null;

    try {
      const { data } = supabase.storage
        .from('questionnaire_attachments')
        .getPublicUrl(`${questionnaire.id}/${fileName}`);
      return data.publicUrl;
    } catch (error) {
      console.error("Error in getFileUrl:", error);
      return null;
    }
  };

  return {
    user,
    questionnaire,
    loading,
    isSaving,
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    attachments,
    setAttachments,
    isLoadingFiles,
    setIsLoadingFiles,
    showSubmitButton,
    isUploading,
    setIsUploading,
    getFileUrl,
    supabase
  };
};