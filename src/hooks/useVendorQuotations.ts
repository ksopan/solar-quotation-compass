
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { User } from "@supabase/supabase-js";

type VendorQuotationItem = Database['public']['Tables']['quotation_requests']['Row'] & {
  customerName?: string;
  customerEmail?: string;
  hasProposal?: boolean;
};

export const useVendorQuotations = (user: User | null) => {
  const [quotations, setQuotations] = useState<VendorQuotationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    newRequests: 0,
    submittedQuotes: 0,
    conversionRate: 24, // Default value
    potentialCustomers: 0
  });

  const fetchQuotations = async (page = 1, limit = 10) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      console.log("Fetching quotations for vendor:", user.id);
      
      // Calculate pagination range
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Fetch the quotations with pagination
      const { data: quotations, error, count } = await supabase
        .from("quotation_requests")
        .select(`
          id, 
          customer_id,
          location, 
          roof_type, 
          energy_usage, 
          roof_area, 
          created_at,
          updated_at,
          status,
          additional_notes,
          budget
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) {
        console.error("Quotation fetch error:", error);
        toast.error("Failed to load quotation requests");
        return { quotations: [], totalPages: 0 };
      }
      
      console.log("Fetched quotations:", quotations);
      
      let processedQuotations: VendorQuotationItem[] = [];
      
      // Get customer details for each quotation
      if (quotations && quotations.length > 0) {
        processedQuotations = await Promise.all(
          quotations.map(async (quotation) => {
            // Get customer profile info
            const { data: customerData, error: customerError } = await supabase
              .from("customer_profiles")
              .select("first_name, last_name, email")
              .eq("id", quotation.customer_id)
              .single();
              
            if (customerError) {
              console.error("Error fetching customer:", customerError);
              return {
                ...quotation, // This includes all the quotation request properties
                customerName: "Unknown Customer",
                customerEmail: ""
              };
            }
            
            // Check if the vendor has already submitted a proposal
            const { data: proposalData, error: proposalError } = await supabase
              .from("quotation_proposals")
              .select("id")
              .eq("quotation_request_id", quotation.id)
              .eq("vendor_id", user.id);
              
            const hasProposal = proposalData && proposalData.length > 0;
              
            return {
              ...quotation, // This includes all the quotation request properties
              customerName: `${customerData.first_name} ${customerData.last_name}`,
              customerEmail: customerData.email,
              hasProposal
            };
          })
        );
      }
      
      // Update stats
      fetchStats();
      
      setQuotations(processedQuotations);
      return { 
        quotations: processedQuotations, 
        totalPages: count ? Math.ceil(count / limit) : 0 
      };
    } catch (error) {
      console.error("Error in fetchQuotations:", error);
      toast.error("An error occurred while loading quotation requests");
      return { quotations: [], totalPages: 0 };
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // Count of new/unviewed requests
      const { count: newCount, error: newError } = await supabase
        .from("quotation_requests")
        .select("id", { count: 'exact' })
        .eq("status", "pending");
        
      // Count of submitted quotes by this vendor
      const { count: submittedCount, error: submittedError } = await supabase
        .from("quotation_proposals")
        .select("id", { count: 'exact' })
        .eq("vendor_id", user.id);
        
      // Count of all potential customers
      const { count: totalCount, error: totalError } = await supabase
        .from("quotation_requests")
        .select("id", { count: 'exact' });
        
      setStats({
        newRequests: newCount || 0,
        submittedQuotes: submittedCount || 0,
        conversionRate: 24, // We'll keep this hardcoded for now
        potentialCustomers: totalCount || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuotations();
    }
  }, [user]);

  return { 
    quotations, 
    loading, 
    stats,
    fetchQuotations,
    fetchStats 
  };
};

export type { VendorQuotationItem };
