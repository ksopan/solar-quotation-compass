import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

export type QuestionnaireDetailData = {
  id: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  property_type: string;
  ownership_status: string;
  monthly_electric_bill: number;
  roof_age_status: string;
  purchase_timeline: string;
  interested_in_batteries: boolean;
  battery_reason: string | null;
  willing_to_remove_trees: boolean;
  created_at: string;
  updated_at: string;
  is_completed: boolean;
};

export const useQuestionnaireDetail = (questionnaireId: string | undefined) => {
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuestionnaireDetails = async () => {
    if (!questionnaireId || !user) return;
    
    try {
      setLoading(true);
      console.log("Fetching questionnaire details for ID:", questionnaireId);
      
      const { data, error } = await supabase
        .from("property_questionnaires")
        .select("*")
        .eq("id", questionnaireId)
        .single();
        
      if (error) {
        console.error("Error fetching questionnaire details:", error);
        toast.error("Failed to load questionnaire details");
        return;
      }
      
      console.log("Fetched questionnaire:", data);
      setQuestionnaire(data);
    } catch (error) {
      console.error("Error in fetchQuestionnaireDetails:", error);
      toast.error("An error occurred while loading the questionnaire details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionnaireDetails();
  }, [questionnaireId, user]);

  return {
    questionnaire,
    loading
  };
};
