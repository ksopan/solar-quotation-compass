
import { Database } from "@/integrations/supabase/types";

export type PropertyQuestionnaireItem = Database['public']['Tables']['property_questionnaires']['Row'] & {
  customerName?: string;
  customerEmail?: string;
  hasProposal?: boolean;
};

export type VendorStats = {
  newRequests: number;
  submittedQuotes: number;
  conversionRate: number;
  potentialCustomers: number;
};

export type QuestionnairesResult = { 
  questionnaires: PropertyQuestionnaireItem[];
  totalPages: number;
};
