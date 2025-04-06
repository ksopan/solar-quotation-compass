
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

export const useQuestionnaire = () => {
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch questionnaire data for the current user
  const fetchQuestionnaire = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check if there's a questionnaire ID in localStorage (from OAuth flow)
      const oauthQuestionnaireId = localStorage.getItem("questionnaire_id");
      if (oauthQuestionnaireId) {
        console.log("Found OAuth questionnaire ID:", oauthQuestionnaireId);
        
        // Associate this questionnaire with the user
        const { error: updateError } = await supabase
          .from("property_questionnaires")
          .update({ customer_id: user.id })
          .eq("id", oauthQuestionnaireId);
          
        if (updateError) {
          console.error("Error associating questionnaire with user:", updateError);
        } else {
          console.log("Successfully associated questionnaire with user");
          // Remove the ID from localStorage
          localStorage.removeItem("questionnaire_id");
        }
      }
      
      // Fetch the user's questionnaire
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
      }
    } catch (error) {
      console.error("Error in fetchQuestionnaire:", error);
      toast.error("An error occurred while loading your questionnaire data");
    } finally {
      setLoading(false);
    }
  };

  // Update questionnaire data
  const updateQuestionnaire = async (updatedData: Partial<QuestionnaireData>) => {
    if (!user || !questionnaire) return false;
    
    try {
      setIsSaving(true);
      console.log("Updating questionnaire with:", updatedData);
      
      const { error } = await supabase
        .from("property_questionnaires")
        .update({
          ...updatedData,
          updated_at: new Date().toISOString()
        })
        .eq("id", questionnaire.id)
        .eq("customer_id", user.id);
      
      if (error) {
        console.error("Error updating questionnaire:", error);
        toast.error("Failed to save your changes");
        return false;
      }
      
      // Update local state
      setQuestionnaire({ 
        ...questionnaire, 
        ...updatedData
      } as QuestionnaireData);
      
      toast.success("Your information has been updated");
      return true;
    } catch (error) {
      console.error("Error in updateQuestionnaire:", error);
      toast.error("An error occurred while saving your changes");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Create a new questionnaire for the user if they don't have one
  const createQuestionnaire = async (data: Omit<QuestionnaireData, 'id' | 'created_at' | 'is_completed'>) => {
    if (!user) return null;
    
    try {
      setIsSaving(true);
      console.log("Creating new questionnaire for user:", user.id);
      
      const { data: newQuestionnaire, error } = await supabase
        .from("property_questionnaires")
        .insert({
          ...data,
          customer_id: user.id,
          is_completed: false
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating questionnaire:", error);
        toast.error("Failed to create your profile");
        return null;
      }
      
      console.log("Created new questionnaire:", newQuestionnaire);
      setQuestionnaire(newQuestionnaire as QuestionnaireData);
      toast.success("Your profile has been created");
      return newQuestionnaire;
    } catch (error) {
      console.error("Error in createQuestionnaire:", error);
      toast.error("An error occurred while creating your profile");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Upload questionnaire attachments
  const uploadAttachment = async (file: File) => {
    if (!user || !questionnaire) return null;
    
    try {
      setIsSaving(true);
      
      // Create a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      
      // Create a folder path with the user's ID and questionnaire ID
      const filePath = `${user.id}/${questionnaire.id}/${fileName}`;
      
      console.log(`Uploading file ${file.name} to path ${filePath}`);
      
      // Check if the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'questionnaire_attachments');
      
      if (!bucketExists) {
        console.error("Bucket 'questionnaire_attachments' doesn't exist");
        toast.error("Storage configuration error. Please contact support.");
        return null;
      }
      
      const { data, error } = await supabase.storage
        .from("questionnaire_attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });
      
      if (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file");
        return null;
      }
      
      console.log("File uploaded:", data);
      return data.path;
    } catch (error) {
      console.error("Error in uploadAttachment:", error);
      toast.error("An error occurred while uploading your file");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Get list of attachments
  const getAttachments = async () => {
    if (!user || !questionnaire) return [];
    
    try {
      // List files in the user's folder for this questionnaire
      const { data, error } = await supabase.storage
        .from("questionnaire_attachments")
        .list(`${user.id}/${questionnaire.id}`);
      
      if (error) {
        console.error("Error listing files:", error);
        toast.error("Failed to load attachments");
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in getAttachments:", error);
      toast.error("An error occurred while loading attachments");
      return [];
    }
  };

  // Delete an attachment
  const deleteAttachment = async (fileName: string) => {
    if (!user || !questionnaire) return false;
    
    try {
      setIsSaving(true);
      
      const filePath = `${user.id}/${questionnaire.id}/${fileName}`;
      
      const { error } = await supabase.storage
        .from("questionnaire_attachments")
        .remove([filePath]);
      
      if (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file");
        return false;
      }
      
      toast.success("File deleted successfully");
      return true;
    } catch (error) {
      console.error("Error in deleteAttachment:", error);
      toast.error("An error occurred while deleting your file");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Get a public URL for a file
  const getFileUrl = (fileName: string) => {
    if (!user || !questionnaire) return null;
    
    const { data } = supabase.storage
      .from("questionnaire_attachments")
      .getPublicUrl(`${user.id}/${questionnaire.id}/${fileName}`);
    
    return data.publicUrl;
  };

  useEffect(() => {
    if (user) {
      fetchQuestionnaire();
    } else {
      setQuestionnaire(null);
      setLoading(false);
    }
  }, [user]);

  return {
    questionnaire,
    loading,
    isSaving,
    updateQuestionnaire,
    createQuestionnaire,
    uploadAttachment,
    getAttachments,
    deleteAttachment,
    getFileUrl,
    fetchQuestionnaire
  };
};
