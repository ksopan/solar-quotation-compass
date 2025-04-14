
import { useState, useEffect, useCallback } from "react";
import { User } from "@/contexts/auth/types";
import { PropertyQuestionnaireItem, VendorStats, QuestionnairesResult } from "./types";
import { fetchQuestionnaires, fetchVendorStats } from "./vendorQuestionnaireApi";

export const useVendorQuotations = (user: User | null) => {
  const [questionnaires, setQuestionnaires] = useState<PropertyQuestionnaireItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<VendorStats>({
    newRequests: 0,
    submittedQuotes: 0,
    conversionRate: 24, // Default value
    potentialCustomers: 0
  });

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    if (!user) return;
    
    const statsData = await fetchVendorStats(user);
    setStats(statsData);
  }, [user]);

  // Fetch questionnaires with pagination
  const fetchQuestionnairesPaginated = useCallback(async (page = 1, limit = 10): Promise<QuestionnairesResult | null> => {
    if (!user) return null;
    
    setLoading(true);
    
    try {
      const result = await fetchQuestionnaires(user, page, limit);
      
      if (result) {
        setQuestionnaires(result.questionnaires);
      }
      
      // Also update stats when questionnaires are fetched
      fetchStats();
      
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error in fetchQuestionnairesPaginated:", error);
      setLoading(false);
      return null;
    }
  }, [user, fetchStats]);

  return { 
    questionnaires, 
    loading, 
    stats,
    fetchQuestionnaires: fetchQuestionnairesPaginated,
    fetchStats 
  };
};

export type { PropertyQuestionnaireItem, VendorStats };
