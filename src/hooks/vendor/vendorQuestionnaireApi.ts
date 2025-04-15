
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
    console.log("Fetching questionnaires for vendor:", user.id, "with role:", user.role);
    
    // Calculate pagination range
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // First, check if there are any completed questionnaires at all - with detailed logging
    const { count: totalCount, error: countError } = await supabase
      .from("property_questionnaires")
      .select('*', { count: 'exact', head: true });
      
    console.log("Total questionnaires in database (regardless of completion):", totalCount);
    
    if (countError) {
      console.error("Error checking questionnaire count:", countError);
      toast.error("Failed to check questionnaire count");
      return null;
    }

    // Log auth status for debugging
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Current user ID:", session?.user?.id);
    console.log("Current JWT role:", session?.user?.user_metadata?.role);
    
    // Explicitly log the auth token to verify permissions
    console.log("✅ Supabase user ID (auth.uid()):", user.id);
    
    // Fetch all property questionnaires without filtering by is_completed to check if any exist
    console.log("Fetching questionnaires without completion filter...");
    const { data: allQuestionnaires, error: allError } = await supabase
      .from("property_questionnaires")
      .select('id, is_completed')
      .limit(5);
      
    console.log("Sample of all questionnaires:", allQuestionnaires);
    
    if (allError) {
      console.error("Error fetching sample questionnaires:", allError);
    }
    
    // Now fetch only completed questionnaires
    console.log("Fetching completed questionnaires...");
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
    
    console.log("Fetched questionnaires result:", questionnaires);
    console.log("Questionnaires count from query:", count);
    
    if (!questionnaires || questionnaires.length === 0) {
      console.log("No questionnaires found for current pagination range");
      
      // Attempt a direct query using try/catch instead of RPC
      try {
        const { data: directCheck, error: directError } = await supabase
          .from('property_questionnaires')
          .select('id, is_completed')
          .eq('is_completed', true)
          .limit(5);
          
        if (directError) {
          console.error("Direct query error:", directError);
        } else {
          console.log("Direct query result:", directCheck);
        }
      } catch (directQueryError) {
        console.error("Error in direct query:", directQueryError);
      }
      
      return { 
        questionnaires: [], 
        totalPages: count ? Math.ceil(count / limit) : 0
      };
    }
    
    // Process questionnaires to check if vendor has submitted a proposal
    const processedQuestionnaires: PropertyQuestionnaireItem[] = await Promise.all(
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
          console.log(`Checking proposal for questionnaire ${questionnaire.id}:`, proposalError);
        }
          
        const hasProposal = !!proposalData;
        console.log(`Questionnaire ${questionnaire.id} has proposal from this vendor:`, hasProposal);
          
        return {
          ...questionnaire,
          customerName,
          customerEmail: questionnaire.email,
          hasProposal
        };
      })
    );
    
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
    // Count of completed questionnaires
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
    console.log("Vendor stats calculated:", {
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
