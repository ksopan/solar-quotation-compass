import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useQuestionnaireDetail } from "@/hooks/useQuestionnaireDetail";
import { QuotationDetailsLoading } from "@/components/customer/QuotationDetailsLoading";
import { QuotationNotFound } from "@/components/customer/QuotationNotFound";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Upload, X, FileText } from "lucide-react";

const SubmitQuote = () => {
  const { id } = useParams<{ id: string }>();
  const { questionnaire, loading } = useQuestionnaireDetail(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    total_price: "",
    warranty_period: "",
    installation_timeframe: "",
    proposal_details: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 20MB.`);
        return false;
      }
      return true;
    });
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (proposalId: string) => {
    if (uploadedFiles.length === 0) return [];

    const uploadedFileRecords = [];

    for (const file of uploadedFiles) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}/${proposalId}/${Date.now()}.${fileExt}`;
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        const { error: uploadError, data } = await supabase.storage
          .from('proposal_documents')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        const { error: dbError } = await supabase
          .from('quotation_proposal_attachments')
          .insert({
            proposal_id: proposalId,
            file_name: file.name,
            file_path: data.path,
            file_type: file.type,
            file_size: file.size
          });

        if (dbError) {
          console.error("DB error:", dbError);
          toast.error(`Failed to save ${file.name} record`);
        } else {
          uploadedFileRecords.push(data.path);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(`Error uploading ${file.name}`);
      }
    }

    return uploadedFileRecords;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !questionnaire) {
      toast.error("Unable to submit quote");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert the proposal
      const { data: proposalData, error: proposalError } = await supabase
        .from("quotation_proposals")
        .insert({
          property_questionnaire_id: questionnaire.id,
          vendor_id: user.id,
          total_price: parseFloat(formData.total_price),
          warranty_period: formData.warranty_period,
          installation_timeframe: formData.installation_timeframe,
          proposal_details: formData.proposal_details,
          status: "pending"
        })
        .select()
        .single();

      if (proposalError) {
        console.error("Error submitting quote:", proposalError);
        toast.error("Failed to submit quote: " + proposalError.message);
        return;
      }

      // Upload files if any
      if (uploadedFiles.length > 0) {
        await uploadFiles(proposalData.id);
      }

      // Send email notification to customer
      try {
        await supabase.functions.invoke('notify-customer-quote', {
          body: {
            customerEmail: questionnaire.email,
            customerName: `${questionnaire.first_name} ${questionnaire.last_name}`,
            proposalId: proposalData.id
          }
        });
      } catch (emailError) {
        console.error("Email notification error:", emailError);
        // Don't fail the submission if email fails
      }

      toast.success("Quote submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while submitting the quote");
    } finally {
      setIsSubmitting(false);
      setUploadProgress({});
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 max-w-4xl">
          <QuotationDetailsLoading />
        </div>
      </MainLayout>
    );
  }

  if (!questionnaire) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 max-w-4xl">
          <QuotationNotFound />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Submit Quote</h1>
          <p className="text-muted-foreground mt-1">
            For {questionnaire.first_name} {questionnaire.last_name}
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{questionnaire.email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Property Type:</span>
                <p className="font-medium">{questionnaire.property_type}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Monthly Bill:</span>
                <p className="font-medium">${questionnaire.monthly_electric_bill}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="total_price">Total Price ($) *</Label>
                  <Input
                    id="total_price"
                    type="number"
                    step="0.01"
                    required
                    value={formData.total_price}
                    onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
                    placeholder="Enter total price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty_period">Warranty Period *</Label>
                  <Input
                    id="warranty_period"
                    required
                    value={formData.warranty_period}
                    onChange={(e) => setFormData({ ...formData, warranty_period: e.target.value })}
                    placeholder="e.g., 25 years"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installation_timeframe">Installation Timeframe *</Label>
                  <Input
                    id="installation_timeframe"
                    required
                    value={formData.installation_timeframe}
                    onChange={(e) => setFormData({ ...formData, installation_timeframe: e.target.value })}
                    placeholder="e.g., 4-6 weeks"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposal_details">Proposal Details *</Label>
                  <Textarea
                    id="proposal_details"
                    required
                    value={formData.proposal_details}
                    onChange={(e) => setFormData({ ...formData, proposal_details: e.target.value })}
                    placeholder="Enter detailed proposal information..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attach Documents (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload documents
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, DOC, XLS, JPG, PNG (max 20MB each)
                      </p>
                    </label>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          {uploadProgress[file.name] !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              {uploadProgress[file.name]}%
                            </span>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Quote"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SubmitQuote;
