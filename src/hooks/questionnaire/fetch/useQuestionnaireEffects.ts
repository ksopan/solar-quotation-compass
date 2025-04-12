
import { useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User as AuthUser } from "@/contexts/auth/types";
import { handleOAuthQuestionnaire } from "./useOAuthFlow";
import { fetchQuestionnaireData } from "./useFetchQuestionnaireData";
import { QuestionnaireData } from "../useQuestionnaireBase";

type QuestionnaireEffectsProps = {
  user: AuthUser | null;
  setQuestionnaire: (questionnaire: QuestionnaireData | null) => void;
  setLoading: (loading: boolean) => void;
};

/**
 * Hook to handle questionnaire-related side effects
 */
export const useQuestionnaireEffects = ({
  user,
  setQuestionnaire,
  setLoading
}: QuestionnaireEffectsProps) => {
  // Fetch questionnaire data on mount
  useEffect(() => {
    const loadQuestionnaireData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Handle OAuth flow if applicable
        await handleOAuthQuestionnaire(user);
        
        // Fetch questionnaire data
        const data = await fetchQuestionnaireData(user);
        setQuestionnaire(data);
      } finally {
        // Always set loading to false when the fetch completes
        setLoading(false);
      }
    };

    loadQuestionnaireData();
  }, [user, setQuestionnaire, setLoading]);
};
