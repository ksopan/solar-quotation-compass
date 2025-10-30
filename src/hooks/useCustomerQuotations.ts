
import { useState, useCallback } from "react";
import { User } from "@/contexts/auth/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuotationProposal {
  id: string;
  vendor_id: string;
  total_price: number;
  warranty_period: string;
  installation_timeframe: string;
  proposal_details: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  property_type: string;
  ownership_status: string;
  monthly_electric_bill: number;
  roof_age_status: string;
  purchase_timeline: string;
  interested_in_batteries: boolean;
  battery_reason: string | null;
  willing_to_remove_trees: boolean;
  created_at: string;
  updated_at: string;
  is_completed: boolean;
  quotation_proposals?: QuotationProposal[];
  proposal_count?: number;
}

export const useCustomerQuotations = (user: User | null) => {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Use useCallback to stabilize the fetchQuotations function
  const fetchQuotations = useCallback(async () => {
    if (!user) {
      setQuotations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("property_questionnaires")
        .select(`
          *,
          quotation_proposals:quotation_proposals(*)
        `)
        .eq("customer_id", user.id)
        .eq("is_completed", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data to include proposal_count
      const transformedData = data.map((questionnaire: any) => ({
        ...questionnaire,
        proposal_count: questionnaire.quotation_proposals?.length || 0
      }));

      setQuotations(transformedData);
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
      toast.error("Failed to load your quotations");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteQuotation = async (id: string): Promise<boolean> => {
    try {
      // Delete associated proposals first
      const { error: proposalError } = await supabase
        .from("quotation_proposals")
        .delete()
        .eq("property_questionnaire_id", id);

      if (proposalError) {
        throw proposalError;
      }

      // Now delete the questionnaire
      const { error } = await supabase
        .from("property_questionnaires")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update the local state
      setQuotations(quotations.filter(q => q.id !== id));
      toast.success("Questionnaire deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting questionnaire:", error);
      toast.error("Failed to delete questionnaire");
      return false;
    }
  };

  return { quotations, loading, fetchQuotations, deleteQuotation };
};
