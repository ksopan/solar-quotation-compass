
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/auth"; // Updated import path
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const QuotationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchQuotationDetails = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("quotation_requests")
          .select(`
            id,
            status,
            created_at,
            location,
            roof_type,
            energy_usage,
            roof_area,
            additional_notes,
            quotation_proposals (count)
          `)
          .eq("id", id)
          .eq("customer_id", user.id)
          .single();
          
        if (error) {
          console.error("Error fetching quotation details:", error);
          toast.error("Failed to load quotation details");
          return;
        }
        
        setQuotation(data);
      } catch (error) {
        console.error("Error in fetchQuotationDetails:", error);
        toast.error("An error occurred while loading the quotation details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuotationDetails();
  }, [id, user]);

  const handleDelete = async () => {
    if (!id || !user) return;
    
    if (confirm("Are you sure you want to delete this quotation?")) {
      try {
        setIsDeleting(true);
        
        const { error } = await supabase
          .from("quotation_requests")
          .delete()
          .eq("id", id)
          .eq("customer_id", user.id);
          
        if (error) {
          console.error("Error deleting quotation:", error);
          toast.error("Failed to delete quotation");
          return;
        }
        
        toast.success("Quotation deleted successfully");
        navigate("/"); // Redirect to home/dashboard after delete
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("An error occurred while deleting the quotation");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 max-w-6xl">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!quotation) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">Quotation Not Found</h1>
          <p>The quotation you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Return to Dashboard
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quotation Details</h1>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Quotation"}
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Request Information</span>
              <Badge 
                variant="outline" 
                className={
                  quotation.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  quotation.status === "approved" ? "bg-green-100 text-green-800" :
                  quotation.status === "rejected" ? "bg-red-100 text-red-800" :
                  ""
                }
              >
                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date Requested</p>
                <p>{format(new Date(quotation.created_at), "MMMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p>{quotation.location}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Roof Type</p>
                <p>{quotation.roof_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Energy Usage</p>
                <p>{quotation.energy_usage} kWh</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Roof Area</p>
                <p>{quotation.roof_area} sq ft</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proposals Received</p>
                <p>{quotation.quotation_proposals?.[0]?.count || 0}</p>
              </div>
            </div>
            
            {quotation.additional_notes && (
              <div>
                <p className="text-sm text-muted-foreground">Additional Notes</p>
                <p>{quotation.additional_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Button onClick={() => navigate("/")} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    </MainLayout>
  );
};

export default QuotationDetails;
