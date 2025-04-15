
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/contexts/auth/types";
import { toast } from "sonner";

/**
 * Directly checks database permissions for debugging purposes
 */
export const checkPermissions = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  try {
    console.log("Checking RLS permissions directly...");
    
    // Try a direct query first
    const { data: directData, error: directError } = await supabase
      .from('property_questionnaires')
      .select('id, is_completed')
      .limit(10);
      
    if (directError) {
      console.error("Direct permission check failed:", directError);
      toast.error("Permission check failed");
      return false;
    } else {
      console.log("Permission check results:", directData);
      if (directData.length > 0) {
        toast.success(`Found ${directData.length} questionnaires in direct check`);
        return true;
      } else {
        toast.warning("No questionnaires found in direct permission check");
        return false;
      }
    }
  } catch (error) {
    console.error("Error in permission check:", error);
    return false;
  }
};
