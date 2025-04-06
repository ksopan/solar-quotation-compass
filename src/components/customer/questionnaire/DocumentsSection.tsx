
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { FilesList } from "./FilesList";

interface DocumentsSectionProps {
  questionnaire: any;
  isLoadingFiles: boolean;
  attachments: Array<{name: string; size: number; id?: string;}>;
  handleFileUpload: (file: File) => Promise<void>;
  handleFileDelete: (fileName: string) => Promise<void>;
  getFileUrl: (fileName: string) => string | null;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({ 
  questionnaire,
  isLoadingFiles,
  attachments,
  handleFileUpload,
  handleFileDelete,
  getFileUrl
}) => {
  if (!questionnaire) return null;
  
  return (
    <div className="pt-4">
      <Label>Property Documents & Photos</Label>
      <div className="mt-2">
        <FileUploader onUpload={handleFileUpload} />
        {isLoadingFiles ? (
          <div className="flex items-center justify-center h-20">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <FilesList 
            files={attachments} 
            onDelete={handleFileDelete} 
            getFileUrl={getFileUrl} 
          />
        )}
      </div>
    </div>
  );
};
