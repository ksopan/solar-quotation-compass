
import { useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuotationItem {
  id: string;
  roof_type: string;
  location: string;
  roof_area: number;
  energy_usage: number;
  budget: number;
  status: string;
  created_at: string;
  customer_id: string;
  additional_notes: string;
  updated_at: string;
  quotation_proposals?: any[];
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
        .from("quotation_requests")
        .select(`
          *,
          quotation_proposals:quotation_proposals(id)
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data to include proposal_count
      const transformedData = data.map((quotation: any) => ({
        ...quotation,
        proposal_count: quotation.quotation_proposals?.length || 0
      }));

      setQuotations(transformedData);
    } catch (error) {
      console.error("Error fetching quotations:", error);
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
        .eq("quotation_request_id", id);

      if (proposalError) {
        throw proposalError;
      }

      // Now delete the quotation
      const { error } = await supabase
        .from("quotation_requests")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update the local state
      setQuotations(quotations.filter(q => q.id !== id));
      toast.success("Quotation deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast.error("Failed to delete quotation");
      return false;
    }
  };

  return { quotations, loading, fetchQuotations, deleteQuotation };
};
