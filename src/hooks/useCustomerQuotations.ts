
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Quotation {
  id: string;
  created_at: string;
  status: string;
  location: string;
  roof_type: string;
  roof_area: number;
  energy_usage: number;
  budget: number | null;
  additional_notes: string | null;
}

export const useCustomerQuotations = (user: any) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = async () => {
    if (!user) {
      setQuotations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotation_requests")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching quotations:", error);
        throw error;
      }

      setQuotations(data as Quotation[]);
    } catch (error) {
      console.error("Error in fetchQuotations:", error);
      toast.error("Failed to load your quotations");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuotation = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("quotation_requests")
        .delete()
        .eq("id", id)
        .eq("customer_id", user.id);

      if (error) {
        console.error("Error deleting quotation:", error);
        toast.error("Failed to delete quotation");
        return false;
      }

      // Update the local state
      setQuotations(quotations.filter((q) => q.id !== id));
      toast.success("Quotation deleted successfully");
      return true;
    } catch (error) {
      console.error("Error in deleteQuotation:", error);
      toast.error("An error occurred while deleting the quotation");
      return false;
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [user]);

  return { quotations, loading, fetchQuotations, deleteQuotation };
};
