
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/contexts/auth/types";
import { PropertyQuestionnaireItem, QuestionnairesResult, VendorStats } from "./types";

/**
 * Fetches questionnaires for vendors with pagination
 */
export const fetchQuestionnaires = async (
  user: User | null,
  page = 1,
  limit = 10
): Promise<QuestionnairesResult | null> => {
  if (!user) return null;
  
  try {
    console.log("Fetching questionnaires for vendor:", user.id);
    
    // Calculate pagination range
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Fetch all completed property questionnaires
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
      return null;
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
            .eq("vendor_id", user.id)
            .single();
            
          if (proposalError && proposalError.code !== 'PGRST116') { // Ignore not found errors
            console.error("Error checking proposal:", proposalError);
          }
            
          const hasProposal = !!proposalData;
            
          return {
            ...questionnaire,
            customerName,
            customerEmail: questionnaire.email,
            hasProposal
          };
        })
      );
    }
    
    // Add more detailed logging to help debug
    console.log("Processed questionnaires:", processedQuestionnaires);
    console.log("Total pages:", count ? Math.ceil(count / limit) : 1);
    
    return { 
      questionnaires: processedQuestionnaires, 
      totalPages: count ? Math.ceil(count / limit) : 1
    };
  } catch (error) {
    console.error("Error in fetchQuestionnaires:", error);
    toast.error("An error occurred while loading property questionnaires");
    return null;
  }
};

/**
 * Fetches vendor dashboard statistics
 */
export const fetchVendorStats = async (user: User | null): Promise<VendorStats> => {
  if (!user) {
    return {
      newRequests: 0,
      submittedQuotes: 0,
      conversionRate: 0,
      potentialCustomers: 0
    };
  }
  
  try {
    // Count of new/unviewed completed questionnaires
    const { count: newCount, error: newError } = await supabase
      .from("property_questionnaires")
      .select("id", { count: 'exact' })
      .eq("is_completed", true);
      
    if (newError) {
      console.error("Error fetching new count:", newError);
    }
    
    const potentialCustomerCount = newCount || 0;
      
    // Count of submitted quotes by this vendor
    const { count: submittedCount, error: submittedError } = await supabase
      .from("quotation_proposals")
      .select("id", { count: 'exact' })
      .eq("vendor_id", user.id);
      
    if (submittedError) {
      console.error("Error fetching submitted count:", submittedError);
    }
    
    const submittedQuotesCount = submittedCount || 0;
    
    // Calculate conversion rate
    const conversionRate = potentialCustomerCount > 0 
      ? Math.round((submittedQuotesCount / potentialCustomerCount) * 100) 
      : 0;
      
    // Log stats for debugging
    console.log("Vendor stats:", {
      newRequests: potentialCustomerCount,
      submittedQuotes: submittedQuotesCount,
      conversionRate,
      potentialCustomers: potentialCustomerCount
    });
    
    return {
      newRequests: potentialCustomerCount,
      submittedQuotes: submittedQuotesCount,
      conversionRate,
      potentialCustomers: potentialCustomerCount
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      newRequests: 0,
      submittedQuotes: 0,
      conversionRate: 24, // Fallback value
      potentialCustomers: 0
    };
  }
};
