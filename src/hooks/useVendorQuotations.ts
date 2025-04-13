
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { User } from "@/contexts/auth/types"; // Changed: Import our custom User type

type PropertyQuestionnaireItem = Database['public']['Tables']['property_questionnaires']['Row'] & {
  customerName?: string;
  customerEmail?: string;
  hasProposal?: boolean;
};

export const useVendorQuotations = (user: User | null) => {
  const [questionnaires, setQuestionnaires] = useState<PropertyQuestionnaireItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    newRequests: 0,
    submittedQuotes: 0,
    conversionRate: 24, // Default value
    potentialCustomers: 0
  });

  const fetchQuestionnaires = async (page = 1, limit = 10) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      console.log("Fetching questionnaires for vendor:", user.id);
      
      // Calculate pagination range
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Fetch the questionnaires with pagination
      const { data: questionnaires, error, count } = await supabase
        .from("property_questionnaires")
        .select(`
          id, 
          customer_id,
          first_name,
          last_name,
          email,
          property_type,
          ownership_status,
          monthly_electric_bill,
          roof_age_status,
          purchase_timeline,
          interested_in_batteries,
          battery_reason,
          willing_to_remove_trees,
          created_at,
          updated_at,
          is_completed
        `, { count: 'exact' })
        .eq('is_completed', true) // Only fetch completed questionnaires
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) {
        console.error("Questionnaire fetch error:", error);
        toast.error("Failed to load property questionnaires");
        return { questionnaires: [], totalPages: 0 };
      }
      
      console.log("Fetched questionnaires:", questionnaires);
      
      let processedQuestionnaires: PropertyQuestionnaireItem[] = [];
      
      // Process questionnaires to check if vendor has submitted a proposal
      if (questionnaires && questionnaires.length > 0) {
        processedQuestionnaires = await Promise.all(
          questionnaires.map(async (questionnaire) => {
            // Prepare customer name from the questionnaire data itself
            const customerName = `${questionnaire.first_name} ${questionnaire.last_name}`;
            
            // Check if the vendor has already submitted a proposal for this questionnaire
            const { data: proposalData, error: proposalError } = await supabase
              .from("quotation_proposals")
              .select("id")
              .eq("quotation_request_id", questionnaire.id)
              .eq("vendor_id", user.id);
              
            if (proposalError) {
              console.error("Error checking proposal:", proposalError);
            }
              
            const hasProposal = proposalData && proposalData.length > 0;
              
            return {
              ...questionnaire,
              customerName,
              customerEmail: questionnaire.email,
              hasProposal
            };
          })
        );
      }
      
      // Update stats
      fetchStats();
      
      setQuestionnaires(processedQuestionnaires);
      return { 
        questionnaires: processedQuestionnaires, 
        totalPages: count ? Math.ceil(count / limit) : 0 
      };
    } catch (error) {
      console.error("Error in fetchQuestionnaires:", error);
      toast.error("An error occurred while loading property questionnaires");
      return { questionnaires: [], totalPages: 0 };
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // Count of new/unviewed completed questionnaires
      const { count: newCount, error: newError } = await supabase
        .from("property_questionnaires")
        .select("id", { count: 'exact' })
        .eq("is_completed", true);
        
      // Count of submitted quotes by this vendor
      const { count: submittedCount, error: submittedError } = await supabase
        .from("quotation_proposals")
        .select("id", { count: 'exact' })
        .eq("vendor_id", user.id);
        
      // Count of all potential customers with completed questionnaires
      const { count: totalCount, error: totalError } = await supabase
        .from("property_questionnaires")
        .select("id", { count: 'exact' })
        .eq("is_completed", true);
        
      setStats({
        newRequests: newCount || 0,
        submittedQuotes: submittedCount || 0,
        conversionRate: 24, // We'll keep this hardcoded for now
        potentialCustomers: totalCount || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuestionnaires();
    }
  }, [user]);

  return { 
    questionnaires, 
    loading, 
    stats,
    fetchQuestionnaires,
    fetchStats 
  };
};

export type { PropertyQuestionnaireItem };
