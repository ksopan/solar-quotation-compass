
import React from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuotationDetailData } from "@/hooks/useQuotationDetail";

interface QuotationDetailsContentProps {
  quotation: QuotationDetailData;
  onDelete: () => void;
  isDeleting: boolean;
}

export const QuotationDetailsContent: React.FC<QuotationDetailsContentProps> = ({
  quotation,
  onDelete,
  isDeleting
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quotation Details</h1>
        <Button 
          variant="destructive" 
          onClick={onDelete}
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
    </>
  );
};
