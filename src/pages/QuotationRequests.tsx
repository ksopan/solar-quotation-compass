
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVendorQuotations, PropertyQuestionnaireItem } from "@/hooks/useVendorQuotations";

const QuotationRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15; // More items per page in the dedicated view
  
  const { fetchQuestionnaires, loading } = useVendorQuotations(user);
  const [questionnaires, setQuestionnaires] = useState<PropertyQuestionnaireItem[]>([]);

  // Fetch questionnaires
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const result = await fetchQuestionnaires(currentPage, itemsPerPage);
      if (result) {
        setQuestionnaires(result.questionnaires);
        setTotalPages(result.totalPages);
      }
    };
    
    loadData();
  }, [user, currentPage, fetchQuestionnaires]);

  if (!user) return null;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (hasProposal?: boolean) => {
    if (hasProposal) {
      return <Badge className="bg-green-500">Quoted</Badge>;
    }
    return <Badge className="bg-blue-500">New</Badge>;
  };

  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">All Property Questionnaires</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-1" /> Filter
            </Button>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-1" /> Search
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : questionnaires.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No property questionnaires found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>All Customer Property Questionnaires</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Property Type</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Monthly Bill</TableHead>
                      <TableHead>Roof Age</TableHead>
                      <TableHead>Battery Interest</TableHead>
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
                        <TableCell>{questionnaire.roof_age_status}</TableCell>
                        <TableCell>{questionnaire.interested_in_batteries ? "Yes" : "No"}</TableCell>
                        <TableCell>{getStatusBadge(questionnaire.hasProposal)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">View Details</Button>
                            {!questionnaire.hasProposal && (
                              <Button size="sm">Submit Quote</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default QuotationRequests;
