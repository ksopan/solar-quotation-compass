
import { useState, useEffect, useCallback } from "react";
import { User } from "@/contexts/auth/types";
import { PropertyQuestionnaireItem, VendorStats, QuestionnairesResult } from "./types";
import { fetchQuestionnaires, fetchVendorStats } from "./vendorQuestionnaireApi";
import { toast } from "sonner";

export const useVendorQuotations = (user: User | null) => {
  const [questionnaires, setQuestionnaires] = useState<PropertyQuestionnaireItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<VendorStats>({
    newRequests: 0,
    submittedQuotes: 0,
    conversionRate: 24, // Default value
    potentialCustomers: 0
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Force refresh function
  const forceRefresh = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const statsData = await fetchVendorStats(user);
      setStats(statsData);
      console.log("Stats updated:", statsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load dashboard statistics");
    }
  }, [user]);

  // Fetch questionnaires with pagination
  const fetchQuestionnairesPaginated = useCallback(async (page = 1, limit = 10): Promise<QuestionnairesResult | null> => {
    if (!user) return null;
    
    console.log("Fetching questionnaires page", page, "with limit", limit);
    setLoading(true);
    setCurrentPage(page);
    setError(null);
    
    try {
      const result = await fetchQuestionnaires(user, page, limit);
      
      if (result) {
        console.log("Setting questionnaires from hook:", result.questionnaires);
        setQuestionnaires(result.questionnaires);
        setTotalPages(result.totalPages);
        
        if (result.questionnaires.length === 0) {
          // Only show toast if we're on page 1 and expected data
          if (page === 1 && result.totalPages > 0) {
            toast.info("No questionnaires found on this page");
          }
        }
      } else {
        console.log("No result returned from fetchQuestionnaires");
        setQuestionnaires([]);
        setError("Failed to load questionnaires data");
      }
      
      // Also update stats when questionnaires are fetched
      await fetchStats();
      
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error in fetchQuestionnairesPaginated:", error);
      setLoading(false);
      setError("An error occurred while loading questionnaires");
      return null;
    }
  }, [user, fetchStats]);

  // Initial data load and refresh on user change or manual refresh
  useEffect(() => {
    console.log("useVendorQuotations effect running with user:", user?.id);
    if (user) {
      fetchQuestionnairesPaginated();
    }
  }, [user, fetchQuestionnairesPaginated, refreshCounter]);

  return { 
    questionnaires, 
    loading, 
    stats,
    totalPages,
    currentPage,
    error,
    fetchQuestionnaires: fetchQuestionnairesPaginated,
    fetchStats,
    refresh: forceRefresh
  };
};
