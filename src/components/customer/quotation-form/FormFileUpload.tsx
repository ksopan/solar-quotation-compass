
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFileUploadProps {
  files: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

export const FormFileUpload: React.FC<FormFileUploadProps> = ({ 
  files, 
  onFileChange, 
  onRemoveFile 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="files">Upload Documents (optional)</Label>
      <Input
        id="files"
        type="file"
        onChange={onFileChange}
        multiple
        className="cursor-pointer"
      />
      
      {files.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium">Selected files:</p>
          <ul className="mt-2 space-y-1">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between text-sm">
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveFile(index)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
