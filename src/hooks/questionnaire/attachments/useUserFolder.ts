
import type { SupabaseClient } from "@supabase/supabase-js";

export const useUserFolder = (supabase: SupabaseClient) => {
  const ensureUserFolder = async (userId: string): Promise<boolean> => {
    try {
      // Check if the folder exists
      const { data: checkFolder } = await supabase.storage
        .from('questionnaire_attachments')
        .list(userId);
        
      if (!checkFolder || checkFolder.length === 0) {
        console.log("📁 Creating user folder for the first time");
        // Create a tiny placeholder file to ensure the folder exists
        const placeholderContent = new Blob([""], { type: "text/plain" });
        await supabase.storage
          .from('questionnaire_attachments')
          .upload(`${userId}/.folder`, placeholderContent, {
            upsert: true
          });
      }
      return true;
    } catch (folderError) {
      console.log("📁 Initializing user folder");
      try {
        // Create a tiny placeholder file to ensure the folder exists
        const placeholderContent = new Blob([""], { type: "text/plain" });
        await supabase.storage
          .from('questionnaire_attachments')
          .upload(`${userId}/.folder`, placeholderContent, {
            upsert: true
          });
        return true;
      } catch (error) {
        console.error("Failed to create user folder:", error);
        return false;
      }
    }
  };

  return { ensureUserFolder };
};
