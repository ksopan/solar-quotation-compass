
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { QuestionnaireData } from "../types";

export const useQuestionnaireProfileState = () => {
  const { user } = useAuth();
  
  // Main state
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [formData, setFormData] = useState<Partial<QuestionnaireData> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // File-related state
  const [attachments, setAttachments] = useState<Array<{name: string; size: number; id?: string;}>>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // UI state
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  
  // Fetch questionnaire data
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("property_questionnaires")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching questionnaire:", error);
          setQuestionnaire(null);
        } else if (data) {
          console.log("Fetched questionnaire:", data);
          setQuestionnaire(data as QuestionnaireData);
          setFormData({...data});
          
          // Set submit button visibility
          if (data.is_completed === false) {
            setShowSubmitButton(true);
          }
        } else {
          setQuestionnaire(null);
        }
      } catch (error) {
        console.error("Error in fetchQuestionnaire:", error);
        setQuestionnaire(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [user]);
  
  // Fetch attachments 
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
        } else if (data) {
          // Convert FileObject array to the expected format
          const formattedData = data.map(file => ({
            name: file.name,
            size: file.metadata?.size || 0,
            id: file.id
          }));
          setAttachments(formattedData);
        } else {
          setAttachments([]);
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
  
  return {
    // User
    user,
    
    // State
    questionnaire,
    formData,
    isEditing,
    loading,
    isSaving,
    attachments,
    isLoadingFiles,
    isUploading,
    showSubmitButton,
    
    // State setters
    setQuestionnaire,
    setFormData,
    setIsEditing,
    setLoading,
    setIsSaving,
    setAttachments,
    setIsLoadingFiles,
    setIsUploading,
    setShowSubmitButton,
    
    // Supabase instance
    supabase
  };
};
