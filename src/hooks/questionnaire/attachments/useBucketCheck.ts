
import { toast } from "sonner";
import type { SupabaseClient } from "@supabase/supabase-js";

export const useBucketCheck = (supabase: SupabaseClient) => {
  const checkBucketExists = async (bucketName: string): Promise<boolean> => {
    try {
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
        
      if (bucketsError) {
        console.error("❌ Error listing buckets:", bucketsError);
        toast.error("Failed to access storage system");
        return false;
      }
      
      // Check if our bucket exists
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      if (!bucketExists) {
        console.error(`⚠️ Storage bucket '${bucketName}' does not exist`);
        toast.error("Storage system not properly configured");
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Unexpected error checking bucket:", error);
      return false;
    }
  };

  return { checkBucketExists };
};
