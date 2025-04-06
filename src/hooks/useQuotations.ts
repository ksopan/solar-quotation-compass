
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { User } from "@supabase/supabase-js";

type QuotationItem = Database['public']['Tables']['quotation_requests']['Row'] & {
  quotation_proposals: { count: number }[];
};

export const useQuotations = (user: User | null) => {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchQuotations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      console.log("Fetching quotations for user:", user.id);
      
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
        .eq("customer_id", user.id);
      
      if (error) {
        console.error("Quotation fetch error:", error);
        toast.error("Failed to load your quotation requests");
        return;
      }
      
      console.log("Fetched quotations:", data);
      
      if (data) {
        setQuotations(data as QuotationItem[]);
      }
    } catch (error) {
      console.error("Error fetching customer quotations:", error);
      toast.error("Failed to load your quotation requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuotations();
    }
  }, [user]);

  return { quotations, loading, fetchQuotations };
};

export type { QuotationItem };
