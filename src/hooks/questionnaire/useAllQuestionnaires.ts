
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PropertyQuestionnaireItem } from "@/hooks/vendor/types";

/**
 * Hook to fetch all property questionnaires
 * This is useful for admin or debugging purposes
 */
export const useAllQuestionnaires = () => {
  const [questionnaires, setQuestionnaires] = useState<PropertyQuestionnaireItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllQuestionnaires = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to use the debug function which bypasses RLS
      console.log("Attempting to fetch questionnaires with debug function...");
      const { data: debugData, error: debugError } = await supabase
        .rpc('get_debug_questionnaires');
        
      if (debugError) {
        console.error("Error using debug function:", debugError);
        
        // Fall back to direct query
        console.log("Falling back to direct query...");
        const { data, error } = await supabase
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
          `)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching questionnaires:", error);
          setError("Failed to fetch questionnaires");
          toast.error("Failed to fetch questionnaires");
          setQuestionnaires([]);
        } else {
          console.log("Fetched questionnaires:", data);
          setQuestionnaires(data || []);
          if (data && data.length > 0) {
            toast.success(`Found ${data.length} questionnaire(s)`);
          } else {
            toast.info("No questionnaires found");
          }
        }
      } else {
        console.log("Successfully fetched questionnaires with debug function:", debugData);
        setQuestionnaires(debugData || []);
        if (debugData && debugData.length > 0) {
          toast.success(`Found ${debugData.length} questionnaire(s) using debug function`);
        } else {
          toast.info("No questionnaires found");
        }
      }
    } catch (error) {
      console.error("Exception fetching questionnaires:", error);
      setError("An error occurred while fetching questionnaires");
      toast.error("An error occurred while fetching questionnaires");
    } finally {
      setLoading(false);
    }
  };

  // Fetch questionnaires on mount
  useEffect(() => {
    fetchAllQuestionnaires();
  }, []);

  return {
    questionnaires,
    loading,
    error,
    refetch: fetchAllQuestionnaires
  };
};
