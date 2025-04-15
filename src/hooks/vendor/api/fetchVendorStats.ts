
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/contexts/auth/types";
import { VendorStats } from "../types";

/**
 * Fetches vendor dashboard statistics
 */
export const fetchVendorStats = async (user: User | null): Promise<VendorStats> => {
  if (!user) {
    return {
      newRequests: 0,
      submittedQuotes: 0,
      conversionRate: 0,
      potentialCustomers: 0
    };
  }
  
  try {
    // Count of completed questionnaires
    const { count: newCount, error: newError } = await supabase
      .from("property_questionnaires")
      .select("id", { count: 'exact' })
      .eq("is_completed", true);
      
    if (newError) {
      console.error("Error fetching new count:", newError);
    }
    
    const potentialCustomerCount = newCount || 0;
      
    // Count of submitted quotes by this vendor
    const { count: submittedCount, error: submittedError } = await supabase
      .from("quotation_proposals")
      .select("id", { count: 'exact' })
      .eq("vendor_id", user.id);
      
    if (submittedError) {
      console.error("Error fetching submitted count:", submittedError);
    }
    
    const submittedQuotesCount = submittedCount || 0;
    
    // Calculate conversion rate
    const conversionRate = potentialCustomerCount > 0 
      ? Math.round((submittedQuotesCount / potentialCustomerCount) * 100) 
      : 0;
      
    // Log stats for debugging
    console.log("Vendor stats calculated:", {
      newRequests: potentialCustomerCount,
      submittedQuotes: submittedQuotesCount,
      conversionRate,
      potentialCustomers: potentialCustomerCount
    });
    
    return {
      newRequests: potentialCustomerCount,
      submittedQuotes: submittedQuotesCount,
      conversionRate,
      potentialCustomers: potentialCustomerCount
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      newRequests: 0,
      submittedQuotes: 0,
      conversionRate: 24, // Fallback value
      potentialCustomers: 0
    };
  }
};
