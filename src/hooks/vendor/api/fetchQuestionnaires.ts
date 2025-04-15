
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/contexts/auth/types";
import { PropertyQuestionnaireItem, QuestionnairesResult } from "../types";

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
    
    // Check if there are any questionnaires at all - for debugging purposes
    const { count: totalCount, error: countError } = await supabase
      .from("property_questionnaires")
      .select('*', { count: 'exact', head: true });
      
    console.log("Total questionnaires in database:", totalCount);
    
    if (countError) {
      console.error("Error checking questionnaire count:", countError);
      toast.error("Failed to check questionnaire count");
      return null;
    }
    
    // If no questionnaires exist at all, return empty result
    if (totalCount === 0) {
      console.log("No questionnaires found in the database at all");
      toast.info("No questionnaires found in the database");
      return { questionnaires: [], totalPages: 0 };
    }

    // Fetch ALL questionnaires (not just completed ones)
    // This is a change from the previous version which only fetched completed questionnaires
    console.log("Fetching all questionnaires...");
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
    
    // Show success toast only if we found questionnaires
    if (processedQuestionnaires.length > 0) {
      toast.success(`Found ${processedQuestionnaires.length} questionnaire(s)`);
    }
    
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
