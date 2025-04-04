
import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { FileText, Home, LightbulbIcon, Zap, X, Upload, FileIcon, FileUp } from "lucide-react";
import QuotationDetails, { QuotationDetails as QuotationDetailsType } from "@/components/customer/QuotationDetails";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface QuotationFormData {
  installationAddress: string;
  roofType: string;
  monthlyBill: number;
  devices: number;
  additionalInfo: string;
}

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationDetailsType | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuotationFormData>({
    installationAddress: user?.address || "",
    roofType: "asphalt",
    monthlyBill: 0,
    devices: 0,
    additionalInfo: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch user's quotation requests
  const { data: quotations = [], isLoading, refetch } = useQuery({
    queryKey: ['quotations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('quotation_requests')
        .select(`
          id,
          status,
          created_at,
          location,
          roof_type,
          energy_usage,
          roof_area,
          additional_notes,
          quotation_proposals(count)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching quotations:", error);
        throw new Error(error.message);
      }
      
      return data.map(q => ({
        id: q.id,
        status: q.status,
        createdAt: new Date(q.created_at).toISOString().split('T')[0],
        totalResponses: q.quotation_proposals.count,
        installationAddress: q.location,
        roofType: q.roof_type,
        monthlyBill: q.energy_usage || 0,
        devices: q.roof_area || 0,
        additionalInfo: q.additional_notes || ""
      }));
    },
    enabled: !!user
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace("installation-", "").replace("-", "")]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      roofType: value
    }));
  };

  const handleQuotationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a quotation request");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert quotation request
      const { data: quotationData, error: quotationError } = await supabase
        .from('quotation_requests')
        .insert({
          customer_id: user.id,
          location: formData.installationAddress,
          roof_type: formData.roofType,
          energy_usage: formData.monthlyBill,
          roof_area: formData.devices,
          additional_notes: formData.additionalInfo,
          status: 'pending',
          budget: null // Optional field
        })
        .select('id')
        .single();
      
      if (quotationError) throw new Error(quotationError.message);
      
      const quotationId = quotationData.id;
      
      // Upload files if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          // Upload file to storage
          const filePath = `${user.id}/${quotationId}/${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('quotation_documents')
            .upload(filePath, file);
          
          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            toast.error(`Failed to upload ${file.name}`);
            continue;
          }
          
          // Record file details in database
          const { error: fileRecordError } = await supabase
            .from('quotation_document_files')
            .insert({
              quotation_id: quotationId,
              file_path: filePath,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size
            });
          
          if (fileRecordError) {
            console.error("Error recording file details:", fileRecordError);
          }
        }
      }
      
      toast.success("Quotation request submitted successfully!");
      setIsDialogOpen(false);
      setUploadedFiles([]);
      setFormData({
        installationAddress: user.address || "",
        roofType: "asphalt",
        monthlyBill: 0,
        devices: 0,
        additionalInfo: ""
      });
      
      // Refresh quotations list
      refetch();
      
    } catch (error) {
      toast.error("Failed to submit quotation request. Please try again.");
      console.error("Quotation submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewQuotationDetails = (quotation: QuotationDetailsType) => {
    setSelectedQuotation(quotation);
    setIsDetailsOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        const fileType = file.type;
        return fileType === 'image/png' || fileType === 'text/plain' || fileType === 'application/pdf';
      });
      
      if (fileArray.length !== validFiles.length) {
        toast.error("Some files were rejected. Only PNG, TXT, and PDF files are allowed.");
      }
      
      setUploadedFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user.firstName}!</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Request a Quotation</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request a Solar Quotation</DialogTitle>
              <DialogDescription>
                Fill in the details below to request a quotation from our vendors
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleQuotationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="installation-address">Installation Address</Label>
                <Input
                  id="installation-address"
                  value={formData.installationAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, State, ZIP"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roof-type">Roof Type</Label>
                <Select 
                  value={formData.roofType} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a roof type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asphalt">Asphalt Shingle</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="tile">Tile</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="monthly-bill">Average Monthly Electricity Bill ($)</Label>
                <Input
                  id="monthly-bill"
                  type="number"
                  value={formData.monthlyBill || ""}
                  onChange={handleInputChange}
                  placeholder="150"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="devices">Number of Electronic Devices</Label>
                <Input
                  id="devices"
                  type="number"
                  value={formData.devices || ""}
                  onChange={handleInputChange}
                  placeholder="10"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additional-info">Additional Information</Label>
                <Textarea
                  id="additional-info"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  placeholder="Any special requirements or questions you have..."
                />
              </div>
              
              {/* File Upload Section */}
              <div className="space-y-2">
                <Label>Upload Documents</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".png,.txt,.pdf"
                  multiple
                  className="hidden"
                />
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={triggerFileInput}
                >
                  <FileUp className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Click to upload PNG, TXT, or PDF files
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    You can upload multiple files
                  </p>
                </div>
              </div>
              
              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div 
                        key={`${file.name}-${index}`} 
                        className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileIcon className="h-4 w-4 shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFile(index)} 
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Quotation Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotations.length}</div>
            <p className="text-xs text-muted-foreground">
              {quotations.filter(q => q.status === "Active").length} active requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received Proposals</CardTitle>
            <LightbulbIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotations.reduce((sum, q) => sum + q.totalResponses, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From our vendor network
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$482/mo</div>
            <p className="text-xs text-muted-foreground">
              Based on your usage patterns
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-6">Your Quotation Requests</h2>
      <div className="grid gap-6">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading your quotations...</p>
              </div>
            </CardContent>
          </Card>
        ) : quotations.length > 0 ? (
          quotations.map((quotation) => (
            <Card key={quotation.id}>
              <CardHeader>
                <CardTitle className="text-lg">Quotation #{quotation.id.substring(0, 8)}</CardTitle>
                <CardDescription>Created on {quotation.createdAt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Status: <span className={
                      quotation.status === "active" ? "text-green-600" : "text-amber-600"
                    }>{quotation.status}</span></p>
                    <p className="text-sm">Total Responses: {quotation.totalResponses}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => viewQuotationDetails(quotation)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6">
                <p className="text-muted-foreground">You haven't requested any quotations yet.</p>
                <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>Request Your First Quotation</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quotation Details Dialog */}
      <QuotationDetails 
        quotation={selectedQuotation}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default CustomerDashboard;
