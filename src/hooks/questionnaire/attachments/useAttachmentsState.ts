
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export type Attachment = {
  name: string;
  size: number;
  id?: string;
};

export const useAttachmentsState = () => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  return {
    user,
    attachments,
    setAttachments,
    isUploading,
    setIsUploading,
    isLoadingFiles,
    setIsLoadingFiles,
    supabase
  };
};
