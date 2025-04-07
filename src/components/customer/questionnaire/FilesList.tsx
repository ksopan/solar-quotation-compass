
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, FileText, FileImage, File } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface FilesListProps {
  files: Array<{name: string; size: number; id?: string;}>;
  onDelete: (fileName: string) => Promise<boolean>;
  getFileUrl: (fileName: string) => string | null;
}

export const FilesList: React.FC<FilesListProps> = ({ 
  files,
  onDelete,
  getFileUrl
}) => {
  if (files.length === 0) {
    return (
      <div className="mt-4 p-6 border border-dashed rounded-lg text-center">
        <p className="text-muted-foreground text-sm">No files uploaded yet</p>
      </div>
    );
  }
  
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <FileImage className="h-4 w-4" />;
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };
  
  const handleDeleteClick = async (fileName: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this file?");
    if (confirmed) {
      await onDelete(fileName);
    }
  };
  
  const handleDownloadClick = (fileName: string) => {
    const url = getFileUrl(fileName);
    if (url) {
      window.open(url, '_blank');
    }
  };
  
  return (
    <div className="mt-4 space-y-2">
      {files.map((file) => (
        <div 
          key={file.name} 
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex items-center">
            {getFileIcon(file.name)}
            <div className="ml-2">
              <p className="text-sm font-medium">{file.name.split('-').slice(1).join('-')}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button 
              onClick={() => handleDownloadClick(file.name)} 
              variant="ghost" 
              size="icon"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => handleDeleteClick(file.name)} 
              variant="ghost" 
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
