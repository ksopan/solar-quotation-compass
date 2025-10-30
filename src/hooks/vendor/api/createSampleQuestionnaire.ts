
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Creates a sample questionnaire for testing purposes
 */
export const createSampleQuestionnaire = async (vendorId: string): Promise<string | null> => {
  try {
    toast.info("Creating sample questionnaire data...");
    
    // Create a sample questionnaire directly
    const { data, error } = await supabase
      .from('property_questionnaires')
      .insert({
        property_type: 'home',
        ownership_status: 'own',
        monthly_electric_bill: 250,
        interested_in_batteries: true,
        battery_reason: 'maximize_savings',
        purchase_timeline: 'within_year',
        willing_to_remove_trees: false,
        roof_age_status: 'no',
        first_name: 'Sample',
        last_name: 'Customer',
        email: 'sample@example.com',
        is_completed: true
      })
      .select('id')
      .single();
      
    if (error) {
      console.error("Error creating sample data:", error);
      toast.error("Failed to create sample data: " + error.message);
      return null;
    }
    
    console.log("Sample data created with ID:", data?.id);
    toast.success("Sample questionnaire created successfully!");
    
    return data?.id || null;
  } catch (err) {
    console.error("Exception creating sample data:", err);
    toast.error("An unexpected error occurred");
    return null;
  }
};
