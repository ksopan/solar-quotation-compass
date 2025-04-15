
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Creates a sample questionnaire for testing purposes
 */
export const createSampleQuestionnaire = async (vendorId: string): Promise<string | null> => {
  try {
    toast.info("Creating sample questionnaire data...");
    
    // Call the RPC function to create a sample questionnaire
    const { data, error } = await supabase
      .rpc('insert_sample_questionnaire', { vendor_id: vendorId });
      
    if (error) {
      console.error("Error creating sample data:", error);
      toast.error("Failed to create sample data: " + error.message);
      return null;
    }
    
    console.log("Sample data created with ID:", data);
    toast.success("Sample questionnaire created successfully!");
    
    return data;
  } catch (err) {
    console.error("Exception creating sample data:", err);
    toast.error("An unexpected error occurred");
    return null;
  }
};
