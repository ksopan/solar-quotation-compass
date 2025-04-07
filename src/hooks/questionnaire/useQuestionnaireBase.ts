
import { useState } from "react";
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

export const useQuestionnaireBase = () => {
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  return {
    user,
    questionnaire,
    setQuestionnaire,
    loading,
    setLoading,
    isSaving,
    setIsSaving,
    supabase
  };
};
