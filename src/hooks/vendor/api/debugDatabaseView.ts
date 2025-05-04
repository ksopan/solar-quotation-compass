
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/contexts/auth/types";

/**
 * Utility function to view the contents of the property_questionnaires table
 * This is for debugging purposes only
 */
export const viewPropertyQuestionnaires = async () => {
  try {
    console.log("Fetching all property questionnaires for debugging...");
    toast.info("Fetching database records...");
    
    // First try to get raw count
    const { count, error: countError } = await supabase
      .from("property_questionnaires")
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error("Error checking questionnaire count:", countError);
      toast.error("Failed to check questionnaire count: " + countError.message);
      return null;
    }
    
    console.log("Total questionnaires in database:", count);
    
    // Now fetch actual records
    const { data, error } = await supabase
      .from("property_questionnaires")
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching questionnaires for debugging:", error);
      toast.error("Failed to fetch data: " + error.message);
      return null;
    }
    
    console.log("Retrieved questionnaires:", data);
    
    if (data && data.length > 0) {
      toast.success(`Found ${data.length} questionnaire records`);
      
      // Print out details of each questionnaire
      data.forEach((item, index) => {
        console.log(`Record ${index + 1}:`, {
          id: item.id,
          customer: `${item.first_name} ${item.last_name}`,
          email: item.email,
          property_type: item.property_type,
          is_completed: item.is_completed,
          created_at: new Date(item.created_at).toLocaleString()
        });
      });
    } else {
      toast.warning("No questionnaire records found in database");
    }
    
    return data;
  } catch (error) {
    console.error("Error in viewPropertyQuestionnaires:", error);
    toast.error("An error occurred while fetching questionnaire data");
    return null;
  }
};
