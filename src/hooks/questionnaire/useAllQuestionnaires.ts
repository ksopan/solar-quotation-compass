
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
      
      // Direct query to property_questionnaires table
      console.log("Fetching questionnaires...");
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
          is_completed,
          status,
          submitted_at,
          proposal_deadline,
          acceptance_deadline,
          version,
          verification_token,
          verified_at
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
