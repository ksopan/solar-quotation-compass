
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { User as AuthUser } from "@/contexts/auth/types";

type QuotationItem = Database['public']['Tables']['quotation_requests']['Row'] & {
  quotation_proposals: { count: number }[];
};

// Helper to transform our auth user to what Supabase needs
const transformToSupabaseUser = (authUser: AuthUser | null) => {
  if (!authUser) return null;
  
  return {
    id: authUser.id,
    email: authUser.email,
    app_metadata: {},
    user_metadata: {},
    aud: "",
    created_at: "",
  };
};

export const useCustomerQuotations = (user: AuthUser | null) => {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const supabaseUser = transformToSupabaseUser(user);
  const userId = supabaseUser?.id;

  const fetchQuotations = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      console.log("Fetching quotations for user:", userId);
      
      const { data, error } = await supabase
        .from("quotation_requests")
        .select(`
          id,
          status,
          created_at,
          location,
          roof_type,
          energy_usage,
          roof_area,
          additional_notes,
          quotation_proposals (count)
        `)
        .eq("customer_id", userId);
      
      if (error) {
        console.error("Quotation fetch error:", error);
        toast.error("Failed to load your quotation requests");
        return;
      }
      
      console.log("Fetched quotations:", data);
      
      if (data) {
        setQuotations(data as QuotationItem[]);
      } else {
        setQuotations([]);
      }
    } catch (error) {
      console.error("Error fetching customer quotations:", error);
      toast.error("Failed to load your quotation requests");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Dedicated function to delete a quotation and return success/failure status
  const deleteQuotation = useCallback(async (quotationId: string) => {
    if (!userId) {
      toast.error("You must be logged in to delete quotations");
      return false;
    }
    
    try {
      console.log(`Attempting to delete quotation ${quotationId} for user ${userId}`);
      
      const { error, count } = await supabase
        .from("quotation_requests")
        .delete({ count: 'exact' }) // Get count of deleted items
        .eq("id", quotationId)
        .eq("customer_id", userId);
      
      if (error) {
        console.error("Error deleting quotation:", error);
        toast.error("Failed to delete quotation: " + error.message);
        return false;
      }
      
      console.log(`Deletion result: ${count} rows affected`);
      
      if (count === 0) {
        toast.error("No quotation found to delete. It may have been removed already.");
        return false;
      }
      
      // Update local state to remove the deleted quotation
      setQuotations(prevQuotations => 
        prevQuotations.filter(quotation => quotation.id !== quotationId)
      );
      
      toast.success("Quotation deleted successfully");
      return true;
    } catch (error) {
      console.error("Error in deleteQuotation:", error);
      toast.error("An unexpected error occurred while deleting the quotation");
      return false;
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchQuotations();
    } else {
      setQuotations([]);
    }
  }, [userId, fetchQuotations]);

  return { quotations, loading, fetchQuotations, deleteQuotation };
};

export type { QuotationItem };
