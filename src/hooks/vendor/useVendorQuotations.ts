
import { useState, useEffect, useCallback } from "react";
import { User } from "@/contexts/auth/types";
import { PropertyQuestionnaireItem, VendorStats, QuestionnairesResult } from "./types";
import { fetchQuestionnaires, fetchVendorStats } from "./vendorQuestionnaireApi";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    toast.info("Forcing data refresh...");
  }, []);

  // Direct debug function to check RLS permissions
  const checkPermissions = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log("Checking RLS permissions directly...");
      
      // Try a direct query first
      const { data: directData, error: directError } = await supabase
        .from('property_questionnaires')
        .select('id, is_completed')
        .limit(10);
        
      if (directError) {
        console.error("Direct permission check failed:", directError);
        toast.error("Permission check failed");
      } else {
        console.log("Permission check results:", directData);
        if (directData.length > 0) {
          toast.success(`Found ${directData.length} questionnaires in direct check`);
        } else {
          toast.warning("No questionnaires found in direct permission check");
        }
      }
    } catch (error) {
      console.error("Error in permission check:", error);
    }
  }, [user]);

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
          if (page === 1) {
            toast.info("No questionnaires found. Use the refresh button to try again.");
            // Try permission check
            checkPermissions();
          }
        } else {
          toast.success(`Found ${result.questionnaires.length} questionnaires`);
        }
      } else {
        console.log("No result returned from fetchQuestionnaires");
        setQuestionnaires([]);
        setError("Failed to load questionnaires data");
        toast.error("Failed to load questionnaires. Check console for details.");
      }
      
      // Also update stats when questionnaires are fetched
      await fetchStats();
      
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error in fetchQuestionnairesPaginated:", error);
      setLoading(false);
      setError("An error occurred while loading questionnaires");
      toast.error("An error occurred while loading questionnaires");
      return null;
    }
  }, [user, fetchStats, checkPermissions]);

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
    refresh: forceRefresh,
    checkPermissions
  };
};
