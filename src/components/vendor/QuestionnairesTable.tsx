
import React from "react";
import { PropertyQuestionnaireItem } from "@/hooks/vendor";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ClipboardList } from "lucide-react";

interface QuestionnairesTableProps {
  questionnaires: PropertyQuestionnaireItem[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPagination?: boolean;
}

export const QuestionnairesTable: React.FC<QuestionnairesTableProps> = ({
  questionnaires,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  showPagination = true
}) => {
  const navigate = useNavigate();
  
  const getStatusBadge = (hasProposal?: boolean, isCompleted?: boolean) => {
    if (!isCompleted) {
      return <Badge className="bg-amber-500">Incomplete</Badge>;
    }
    if (hasProposal) {
      return <Badge className="bg-green-500">Quoted</Badge>;
    }
    return <Badge className="bg-blue-500">New</Badge>;
  };

  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  const handleViewDetails = (questionnaireId: string) => {
    navigate(`/questionnaire/${questionnaireId}`);
  };

  const handleSubmitQuote = (questionnaireId: string) => {
    toast.info("Preparing to submit quote");
    console.log("Submit quote for:", questionnaireId);
    // Navigate to submit quote page
    navigate(`/submit-quote/${questionnaireId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (questionnaires.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center p-6">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No questionnaires found</h3>
            <p className="text-muted-foreground">No property questionnaires found in the database</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Property Type</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Monthly Bill</TableHead>
                <TableHead>Roof Age</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questionnaires.map((questionnaire) => (
                <TableRow key={questionnaire.id}>
                  <TableCell className="font-medium">{questionnaire.customerName}</TableCell>
                  <TableCell>{formatPropertyType(questionnaire.property_type)}</TableCell>
                  <TableCell>{format(parseISO(questionnaire.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell>${questionnaire.monthly_electric_bill}</TableCell>
                  <TableCell>{questionnaire.roof_age_status.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{getStatusBadge(questionnaire.hasProposal, questionnaire.is_completed)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewDetails(questionnaire.id)}
                      >
                        View Details
                      </Button>
                      {questionnaire.is_completed && !questionnaire.hasProposal && (
                        <Button 
                          size="sm"
                          onClick={() => handleSubmitQuote(questionnaire.id)}
                        >
                          Submit Quote
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Pagination - show only if showPagination is true AND totalPages > 1 */}
      {showPagination && totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink 
                  isActive={page === currentPage}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};
