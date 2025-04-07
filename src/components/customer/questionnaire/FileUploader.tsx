
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/lib/utils";

interface FileUploaderProps {
  onUpload: (file: File) => Promise<string | null>;
  isUploading?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onUpload,
  isUploading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      await onUpload(file);
      
      // Clear the input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Clear the selected file after upload completes
      setTimeout(() => setSelectedFile(null), 3000);
    }
  };
  
  return (
    <div className="mb-4 space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
      />
      <Button 
        onClick={handleButtonClick}
        type="button"
        variant="outline"
        className="flex items-center"
        disabled={isUploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload Document or Photo
      </Button>
      
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-600 animate-pulse">
              {selectedFile ? `Uploading ${selectedFile.name}` : 'Uploading file...'}
            </span>
            <span className="text-xs text-gray-500">
              {selectedFile ? formatFileSize(selectedFile.size) : 'Please wait'}
            </span>
          </div>
          <Progress value={100} className="h-1" />
        </div>
      )}
    </div>
  );
};
