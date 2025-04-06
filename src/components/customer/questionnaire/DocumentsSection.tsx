
import React from "react";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { FilesList } from "./FilesList";
import { Progress } from "@/components/ui/progress";

interface DocumentsSectionProps {
  questionnaire: any;
  isLoadingFiles: boolean;
  attachments: Array<{name: string; size: number; id?: string;}>;
  handleFileUpload: (file: File) => Promise<void>;
  handleFileDelete: (fileName: string) => Promise<void>;
  getFileUrl: (fileName: string) => string | null;
  isUploading?: boolean;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({ 
  questionnaire,
  isLoadingFiles,
  attachments,
  handleFileUpload,
  handleFileDelete,
  getFileUrl,
  isUploading = false
}) => {
  if (!questionnaire) return null;
  
  return (
    <div className="pt-4">
      <Label>Property Documents & Photos</Label>
      <div className="mt-2">
        <FileUploader onUpload={handleFileUpload} />
        
        {isUploading && (
          <div className="my-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-600 animate-pulse">Uploading file...</span>
              <span className="text-xs text-gray-500">Please wait</span>
            </div>
            <Progress value={100} className="h-1" />
          </div>
        )}
        
        {isLoadingFiles ? (
          <div className="flex flex-col items-center justify-center h-20 gap-2">
            <Loader className="h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading files...</p>
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
