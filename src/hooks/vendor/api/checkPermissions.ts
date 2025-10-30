
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/contexts/auth/types";

/**
 * Debug function to check if the user has proper permissions
 * to access questionnaires data
 */
export const checkPermissions = async (user: User) => {
  try {
    console.log("Checking permissions for user:", user.id);
    toast.info("Testing database permissions...");
    
    // First, check what tables the user can access
    console.log("Testing access to property_questionnaires table...");
    
    // Try to fetch all questionnaires - no filters
    const { data: allQuestionnaires, error: allError } = await supabase
      .from("property_questionnaires")
      .select("id, first_name, last_name, email, is_completed")
      .limit(25);
      
    if (allError) {
      console.error("Error fetching all questionnaires:", allError);
      toast.error("Cannot access questionnaires: " + allError.message);
    } else {
      console.log(`SUCCESS: Found ${allQuestionnaires?.length || 0} total questionnaires`);
      toast.success(`Found ${allQuestionnaires?.length || 0} total questionnaires in database`);
      
      // Log each questionnaire for debugging
      allQuestionnaires?.forEach((q, index) => {
        console.log(`Questionnaire ${index + 1}:`, q);
      });
      
      // Count completed questionnaires
      const completedCount = allQuestionnaires?.filter(q => q.is_completed).length || 0;
      console.log(`Completed questionnaires: ${completedCount}`);
      toast.info(`Completed questionnaires: ${completedCount}`);
    }
    
    // Check if the user can query the proposals table
    console.log("Testing access to quotation_proposals table...");
    const { data: proposalData, error: proposalError } = await supabase
      .from("quotation_proposals")
      .select("*")
      .eq("vendor_id", user.id)
      .limit(5);
      
    if (proposalError) {
      console.error("Quotation proposals access error:", proposalError);
      toast.error("Cannot access quotation proposals: " + proposalError.message);
    } else {
      console.log(`Found ${proposalData?.length || 0} proposals for this vendor`);
      toast.success(`Found ${proposalData?.length || 0} proposals for this vendor`);
    }
    
    return true;
  } catch (error) {
    console.error("Error in checkPermissions:", error);
    toast.error("Error checking permissions");
    return false;
  }
};
