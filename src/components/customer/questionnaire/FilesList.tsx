
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Image, File, Trash2, Download, ExternalLink } from "lucide-react";

interface FilesListProps {
  files: Array<{name: string; size: number; id?: string;}>;
  onDelete: (fileName: string) => Promise<void>;
  getFileUrl: (fileName: string) => string | null;
}

export const FilesList: React.FC<FilesListProps> = ({ files, onDelete, getFileUrl }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No files uploaded yet
      </div>
    );
  }
  
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    } else if (['pdf', 'doc', 'docx'].includes(extension || '')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  return (
    <div className="mt-4 space-y-2">
      {files.map((file) => (
        <div 
          key={file.name} 
          className="flex items-center justify-between p-3 border rounded-md bg-background"
        >
          <div className="flex items-center space-x-3">
            {getFileIcon(file.name)}
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                const url = getFileUrl(file.name);
                if (url) window.open(url, '_blank');
              }}
              title="View file"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                const url = getFileUrl(file.name);
                if (url) {
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = file.name;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }
              }}
              title="Download file"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(file.name)}
              className="text-red-500 hover:text-red-700 hover:bg-red-100"
              title="Delete file"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
