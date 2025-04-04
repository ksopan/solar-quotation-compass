
import React, { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type QuotationFormValues = {
  location: string;
  roofType: string;
  energyUsage: number;
  roofArea: number;
  additionalNotes: string;
  files: File[];
};

interface QuotationFormProps {
  onSuccess: () => void;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuotationFormValues>({
    location: "",
    roofType: "flat",
    energyUsage: 0,
    roofArea: 0,
    additionalNotes: "",
    files: []
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === "energyUsage" || name === "roofArea") {
      const numericValue = value === "" ? 0 : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleRoofTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, roofType: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, files: [...prev.files, ...filesArray] }));
    }
  };
  
  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a quotation request");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Create the quotation request
      const { data: quotation, error: quotationError } = await supabase
        .from("quotation_requests")
        .insert({
          customer_id: user.id,
          location: formData.location,
          roof_type: formData.roofType,
          energy_usage: formData.energyUsage,
          roof_area: formData.roofArea,
          additional_notes: formData.additionalNotes,
          status: "pending"
        })
        .select()
        .single();
      
      if (quotationError) {
        throw new Error(`Error creating quotation: ${quotationError.message}`);
      }
      
      if (!quotation) {
        throw new Error("Failed to create quotation request");
      }
      
      // 2. Upload any attached files
      if (formData.files.length > 0) {
        const uploadPromises = formData.files.map(async (file) => {
          const filePath = `${quotation.id}/${file.name}`;
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from("quotation_documents")
            .upload(filePath, file);
          
          if (uploadError) {
            throw new Error(`Error uploading file: ${uploadError.message}`);
          }
          
          // Get public URL
          const { data: publicURL } = supabase.storage
            .from("quotation_documents")
            .getPublicUrl(filePath);
          
          // Record file in database
          const { error: fileRecordError } = await supabase
            .from("quotation_document_files")
            .insert({
              quotation_id: quotation.id,
              file_path: publicURL.publicUrl,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size
            });
          
          if (fileRecordError) {
            throw new Error(`Error recording file: ${fileRecordError.message}`);
          }
        });
        
        await Promise.all(uploadPromises);
      }
      
      toast.success("Quotation request submitted successfully");
      setFormData({
        location: "",
        roofType: "flat",
        energyUsage: 0,
        roofArea: 0,
        additionalNotes: "",
        files: []
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting quotation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit quotation request");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Solar Panel Quotation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Installation Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter your address"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="roofType">Roof Type</Label>
            <Select value={formData.roofType} onValueChange={handleRoofTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select roof type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="sloped">Sloped</SelectItem>
                <SelectItem value="metal">Metal</SelectItem>
                <SelectItem value="tile">Tile</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="energyUsage">Monthly Energy Usage (kWh)</Label>
              <Input
                id="energyUsage"
                name="energyUsage"
                type="number"
                min="0"
                step="any"
                value={formData.energyUsage || ""}
                onChange={handleInputChange}
                placeholder="e.g., 500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roofArea">Roof Area (sq ft)</Label>
              <Input
                id="roofArea"
                name="roofArea"
                type="number"
                min="0"
                step="any"
                value={formData.roofArea || ""}
                onChange={handleInputChange}
                placeholder="e.g., 1000"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Notes</Label>
            <Textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
              placeholder="Any specific requirements or questions"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="files">Upload Documents (optional)</Label>
            <Input
              id="files"
              type="file"
              onChange={handleFileChange}
              multiple
              className="cursor-pointer"
            />
            
            {formData.files.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Selected files:</p>
                <ul className="mt-2 space-y-1">
                  {formData.files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between text-sm">
                      <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
