
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      console.log("Selected file:", file.name, "size:", file.size);
      
      setErrorMessage(null);
      setSelectedFile(file);
      
      // Check for spaces and special characters in filename
      const hasSpecialChars = /[^a-zA-Z0-9.-]/.test(file.name);
      if (hasSpecialChars) {
        console.log("File name contains spaces or special characters. These will be replaced with underscores.");
      }
      
      // Upload file
      try {
        await onUpload(file);
      } catch (error) {
        console.error("Error uploading file:", error);
        setErrorMessage("Error uploading file. Please try again.");
      }
      
      // Clear the input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Clear the selected file after upload completes
      setTimeout(() => {
        setSelectedFile(null);
        setErrorMessage(null);
      }, 3000);
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
      
      {isUploading && selectedFile && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-600 animate-pulse">
              Uploading {selectedFile.name}
            </span>
            <span className="text-xs text-gray-500">
              {formatFileSize(selectedFile.size)}
            </span>
          </div>
          <Progress value={100} className="h-1" />
        </div>
      )}
      
      {isUploading && !selectedFile && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-600 animate-pulse">
              Uploading file...
            </span>
            <span className="text-xs text-gray-500">
              Please wait
            </span>
          </div>
          <Progress value={100} className="h-1" />
        </div>
      )}
      
      {errorMessage && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
