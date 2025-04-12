
import { useEffect } from "react";
import { toast } from "sonner";
import { useBucketCheck } from "./useBucketCheck";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Attachment } from "./useAttachmentsState";

export const useAttachmentsFetch = (
  user: any,
  supabase: SupabaseClient,
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>,
  setIsLoadingFiles: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { checkBucketExists } = useBucketCheck(supabase);

  useEffect(() => {
    const fetchAttachments = async () => {
      if (!user) {
        setAttachments([]);
        return;
      }

      try {
        setIsLoadingFiles(true);
        console.log("📂 Fetching attachments for user:", user.id);

        // Check if bucket exists
        const bucketExists = await checkBucketExists('questionnaire_attachments');
        if (!bucketExists) {
          setAttachments([]);
          return;
        }

        const { data, error } = await supabase.storage
          .from('questionnaire_attachments')
          .list(user.id, {
            sortBy: { column: 'name', order: 'asc' }
          });

        if (error) {
          console.error("❌ Error listing files:", error);
          
          // If the folder doesn't exist yet, this is not an error
          if (error.message.includes("The specified key does not exist")) {
            console.log("📁 No files folder exists yet for this user - this is normal for new users");
            setAttachments([]);
          } else {
            toast.error("Failed to load attachments");
            setAttachments([]);
          }
        } else {
          console.log("✅ Fetched attachments:", data);
          // Transform FileObject into the expected format with the required size property
          const formattedData = data.map(file => ({
            name: file.name,
            size: file.metadata?.size || 0,
            id: file.id
          }));
          setAttachments(formattedData);
        }
      } catch (err) {
        console.error("❌ Error in getAttachments:", err);
        toast.error("An error occurred while loading attachments");
        setAttachments([]);
      } finally {
        setIsLoadingFiles(false);
      }
    };

    fetchAttachments();
  }, [user, setAttachments, setIsLoadingFiles, supabase, checkBucketExists]);
};
