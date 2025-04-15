
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/contexts/auth/types";

/**
 * Debug function to check if the user has proper permissions
 * to access questionnaires data
 */
export const checkPermissions = async (user: User) => {
  try {
    console.log("Checking permissions for user:", user.id);
    toast.info("Testing database permissions...");
    
    // First, try to fetch all questionnaires using the debug RPC function
    const { data: debugData, error: debugError } = await supabase
      .rpc('get_debug_questionnaires');
      
    console.log("Debug RPC result:", debugData);
    
    if (debugError) {
      console.error("Debug RPC error:", debugError);
      toast.error("Debug RPC check failed: " + debugError.message);
    } else if (debugData && debugData.length > 0) {
      toast.success("Successfully retrieved data via debug RPC");
      console.log("Debug RPC questionnaires:", debugData);
    } else {
      toast.warning("Debug RPC returned no data");
    }
    
    // Next, try a direct query to the table
    const { data: tableData, error: tableError } = await supabase
      .from("property_questionnaires")
      .select("*")
      .limit(3);
      
    if (tableError) {
      console.error("Direct table query error:", tableError);
      toast.error("Direct table query failed: " + tableError.message);
    } else {
      console.log("Direct table query result:", tableData);
      toast.success(`Direct query returned ${tableData?.length || 0} rows`);
    }
    
    // Check if the user can query the proposals
    const { data: proposalData, error: proposalError } = await supabase
      .from("quotation_proposals")
      .select("*")
      .eq("vendor_id", user.id)
      .limit(3);
      
    if (proposalError) {
      console.error("Proposals query error:", proposalError);
      toast.error("Proposals query failed: " + proposalError.message);
    } else {
      console.log("Proposals query result:", proposalData);
      toast.success(`Proposals query returned ${proposalData?.length || 0} rows`);
    }
    
    return true;
  } catch (error) {
    console.error("Error in checkPermissions:", error);
    toast.error("Error checking permissions");
    return false;
  }
};
