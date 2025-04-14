
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { User } from "@/contexts/auth/types"; // Using our custom User type

type PropertyQuestionnaireItem = Database['public']['Tables']['property_questionnaires']['Row'] & {
  customerName?: string;
  customerEmail?: string;
  hasProposal?: boolean;
};

// Sample data for testing when no questionnaires exist in the database
const SAMPLE_DATA: PropertyQuestionnaireItem[] = [
  {
    id: "1",
    customer_id: "cust-1",
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@example.com",
    property_type: "residential",
    ownership_status: "owned",
    monthly_electric_bill: 150,
    roof_age_status: "5-10 years",
    purchase_timeline: "3-6 months",
    interested_in_batteries: true,
    battery_reason: "backup power",
    willing_to_remove_trees: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_completed: true,
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    hasProposal: false
  },
  {
    id: "2",
    customer_id: "cust-2",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.j@example.com",
    property_type: "commercial",
    ownership_status: "owned",
    monthly_electric_bill: 450,
    roof_age_status: "less than 5 years",
    purchase_timeline: "immediately",
    interested_in_batteries: true,
    battery_reason: "cost savings",
    willing_to_remove_trees: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_completed: true,
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@example.com",
    hasProposal: true
  },
  {
    id: "3",
    customer_id: "cust-3",
    first_name: "Michael",
    last_name: "Brown",
    email: "m.brown@example.com",
    property_type: "residential",
    ownership_status: "rented",
    monthly_electric_bill: 200,
    roof_age_status: "10-15 years",
    purchase_timeline: "6-12 months",
    interested_in_batteries: false,
    willing_to_remove_trees: false,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_completed: true,
    customerName: "Michael Brown",
    customerEmail: "m.brown@example.com",
    hasProposal: false
  }
];

export const useVendorQuotations = (user: User | null) => {
  const [questionnaires, setQuestionnaires] = useState<PropertyQuestionnaireItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    newRequests: 0,
    submittedQuotes: 0,
    conversionRate: 24, // Default value
    potentialCustomers: 0
  });

  // Use useCallback to prevent recreation on every render
  const fetchQuestionnaires = useCallback(async (page = 1, limit = 10) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      
      console.log("Fetching questionnaires for vendor:", user.id);
      
      // Calculate pagination range
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Fetch all completed property questionnaires
      const { data: questionnaires, error, count } = await supabase
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
          is_completed
        `, { count: 'exact' })
        .eq('is_completed', true) // Only fetch completed questionnaires
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (error) {
        console.error("Questionnaire fetch error:", error);
        toast.error("Failed to load property questionnaires");
        return null;
      }
      
      console.log("Fetched questionnaires:", questionnaires);
      
      let processedQuestionnaires: PropertyQuestionnaireItem[] = [];
      
      // Process questionnaires to check if vendor has submitted a proposal
      if (questionnaires && questionnaires.length > 0) {
        processedQuestionnaires = await Promise.all(
          questionnaires.map(async (questionnaire) => {
            // Prepare customer name from the questionnaire data itself
            const customerName = `${questionnaire.first_name} ${questionnaire.last_name}`;
            
            // Check if the vendor has already submitted a proposal for this questionnaire
            const { data: proposalData, error: proposalError } = await supabase
              .from("quotation_proposals")
              .select("id")
              .eq("quotation_request_id", questionnaire.id)
              .eq("vendor_id", user.id)
              .single();
              
            if (proposalError && proposalError.code !== 'PGRST116') { // Ignore not found errors
              console.error("Error checking proposal:", proposalError);
            }
              
            const hasProposal = !!proposalData;
              
            return {
              ...questionnaire,
              customerName,
              customerEmail: questionnaire.email,
              hasProposal
            };
          })
        );
      } else {
        // If no data found in database, use sample data for testing/visualization
        console.log("No questionnaires found in database, using sample data for testing");
        processedQuestionnaires = SAMPLE_DATA;
      }
      
      // Update stats
      fetchStats();
      
      setQuestionnaires(processedQuestionnaires);
      setLoading(false);
      
      return { 
        questionnaires: processedQuestionnaires, 
        totalPages: count ? Math.ceil(count / limit) : Math.ceil(SAMPLE_DATA.length / limit)
      };
    } catch (error) {
      console.error("Error in fetchQuestionnaires:", error);
      toast.error("An error occurred while loading property questionnaires");
      setLoading(false);
      return null;
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    
    try {
      // Count of new/unviewed completed questionnaires
      const { count: newCount, error: newError } = await supabase
        .from("property_questionnaires")
        .select("id", { count: 'exact' })
        .eq("is_completed", true);
        
      if (newError) console.error("Error fetching new count:", newError);
      
      // If no data in DB, use sample data length
      const potentialCustomerCount = newCount || SAMPLE_DATA.length;
        
      // Count of submitted quotes by this vendor
      const { count: submittedCount, error: submittedError } = await supabase
        .from("quotation_proposals")
        .select("id", { count: 'exact' })
        .eq("vendor_id", user.id);
        
      if (submittedError) console.error("Error fetching submitted count:", submittedError);
      
      // Use sample submitted quotes count if none in DB
      const submittedQuotesCount = submittedCount || 1;
        
      setStats({
        newRequests: potentialCustomerCount,
        submittedQuotes: submittedQuotesCount,
        conversionRate: 24, // Hardcoded for now
        potentialCustomers: potentialCustomerCount
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, [user]);

  return { 
    questionnaires, 
    loading, 
    stats,
    fetchQuestionnaires,
    fetchStats 
  };
};

export type { PropertyQuestionnaireItem };
