import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import QuotationDetails from "./QuotationDetails";
import ProposalDetailsModal from "./ProposalDetailsModal";
import { useAuth } from "@/contexts/auth";
import { useCustomerQuotations } from "@/hooks/useCustomerQuotations";

type QuotationProposal = {
  id: string;
  vendor_id: string;
  total_price: number;
  warranty_period: string;
  installation_timeframe: string;
  proposal_details: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type QuotationItem = Database['public']['Tables']['property_questionnaires']['Row'] & {
  quotation_proposals?: QuotationProposal[];
};

// Convert QuotationItem to QuotationDetails format
const mapToQuotationDetails = (quotation: QuotationItem) => {
  return {
    id: quotation.id,
    status: quotation.is_completed ? 'completed' : 'pending',
    createdAt: format(new Date(quotation.created_at), "MMM d, yyyy"),
    totalResponses: quotation.quotation_proposals?.length || 0,
    installationAddress: `${quotation.property_type} - ${quotation.ownership_status}`,
    roofType: quotation.roof_age_status,
    monthlyBill: quotation.monthly_electric_bill,
    devices: quotation.interested_in_batteries ? 1 : 0,
    additionalInfo: `Purchase timeline: ${quotation.purchase_timeline}`,
    file_ids: []
  };
};

interface QuotationListProps {
  quotations: QuotationItem[];
  loading: boolean;
  onRefresh?: () => void; // Optional: used to reload data after delete
  deleteQuotation?: (id: string) => Promise<boolean>; // New prop to receive the delete function
}

export const QuotationList: React.FC<QuotationListProps> = ({ 
  quotations, 
  loading, 
  onRefresh,
  deleteQuotation 
}) => {
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationItem | null>(null);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDeleteQuotation = async (id: string) => {
    try {
      setIsDeleting(true);
      console.log("Deleting quotation with ID:", id);
      
      let success = false;
      
      // First try using the provided deleteQuotation function from parent
      if (deleteQuotation) {
        console.log("Using provided deleteQuotation function");
        success = await deleteQuotation(id);
      } 
      
      // If deletion was successful or there's no dedicated function
      if (success) {
        console.log("Deletion successful");
        setSelectedQuotation(null);
        
        // Refresh the quotation list (if callback provided)
        if (onRefresh) {
          console.log("Refreshing quotation list after deletion");
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting the quotation");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (quotation: QuotationItem) => {
    const proposalCount = quotation.quotation_proposals?.length || 0;
    
    if (proposalCount === 0) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Awaiting Proposals</Badge>;
    }
    return <Badge variant="outline" className="bg-green-100 text-green-800">
      {proposalCount} Proposal{proposalCount > 1 ? 's' : ''} Received
    </Badge>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Quotation Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">You haven't submitted any quotation requests yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Quotation Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Property Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proposals</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell>{format(new Date(quotation.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>{quotation.property_type} ({quotation.ownership_status})</TableCell>
                    <TableCell>{getStatusBadge(quotation)}</TableCell>
                    <TableCell>{quotation.quotation_proposals?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedQuestionnaireId(quotation.id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal for proposal details */}
      {selectedQuestionnaireId && (
        <ProposalDetailsModal
          questionnaireId={selectedQuestionnaireId}
          isOpen={!!selectedQuestionnaireId}
          onClose={() => setSelectedQuestionnaireId(null)}
        />
      )}
    </>
  );
};
