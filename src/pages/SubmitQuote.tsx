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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !questionnaire) {
      toast.error("Unable to submit quote");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("quotation_proposals")
        .insert({
          quotation_request_id: questionnaire.id,
          vendor_id: user.id,
          total_price: parseFloat(formData.total_price),
          warranty_period: formData.warranty_period,
          installation_timeframe: formData.installation_timeframe,
          proposal_details: formData.proposal_details,
          status: "pending"
        });

      if (error) {
        console.error("Error submitting quote:", error);
        toast.error("Failed to submit quote");
        return;
      }

      toast.success("Quote submitted successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while submitting the quote");
    } finally {
      setIsSubmitting(false);
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
