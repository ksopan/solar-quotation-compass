
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

  useEffect(() => {
    if (userId) {
      fetchQuotations();
    } else {
      setQuotations([]);
    }
  }, [userId, fetchQuotations]);

  return { quotations, loading, fetchQuotations };
};

export type { QuotationItem };
