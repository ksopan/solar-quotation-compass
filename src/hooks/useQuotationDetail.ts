
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

export type QuotationDetailData = {
  id: string;
  status: string;
  created_at: string;
  location: string;
  roof_type: string;
  energy_usage: number | null;
  roof_area: number;
  additional_notes: string | null;
  quotation_proposals: { count: number }[];
};

export const useQuotationDetail = (quotationId: string | undefined) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<QuotationDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQuotationDetails = async () => {
    if (!quotationId || !user) return;
    
    try {
      setLoading(true);
      console.log("Fetching quotation details for ID:", quotationId);
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
        .eq("id", quotationId)
        .eq("customer_id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching quotation details:", error);
        toast.error("Failed to load quotation details");
        return;
      }
      
      console.log("Fetched quotation:", data);
      setQuotation(data);
    } catch (error) {
      console.error("Error in fetchQuotationDetails:", error);
      toast.error("An error occurred while loading the quotation details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!quotationId || !user) return;
    
    if (confirm("Are you sure you want to delete this quotation?")) {
      try {
        setIsDeleting(true);
        console.log("Starting deletion process for quotation ID:", quotationId);
        
        // Request with exact count to verify deletion
        const { error, count } = await supabase
          .from("quotation_requests")
          .delete({ count: 'exact' })
          .eq("id", quotationId)
          .eq("customer_id", user.id);
          
        if (error) {
          console.error("Error deleting quotation:", error);
          toast.error("Failed to delete quotation: " + error.message);
          return;
        }
        
        console.log(`Deletion result: ${count} rows affected`);
        
        if (count === 0) {
          toast.error("No quotation found to delete. It may have been removed already.");
          return;
        }
        
        console.log("Deletion successful, redirecting to dashboard");
        toast.success("Quotation deleted successfully");
        navigate("/"); // Redirect to home/dashboard after delete
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("An error occurred while deleting the quotation");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  useEffect(() => {
    fetchQuotationDetails();
  }, [quotationId, user]);

  return {
    quotation,
    loading,
    isDeleting,
    handleDelete
  };
};
