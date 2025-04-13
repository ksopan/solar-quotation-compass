
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

const QuotationRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quotationRequests, setQuotationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 15; // More items per page in the dedicated view

  // Fetch quotation requests
  useEffect(() => {
    if (!user) return;

    const fetchQuotationRequests = async () => {
      try {
        setLoading(true);
        console.log("Fetching all quotation requests for vendor");
        
        // Fetch quotation requests with pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        
        // Fetch the quotations
        const { data: quotations, error, count } = await supabase
          .from("quotation_requests")
          .select(`
            id, 
            customer_id,
            location, 
            roof_type, 
            energy_usage, 
            roof_area, 
            created_at, 
            status,
            additional_notes
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);
          
        if (error) {
          console.error("Error fetching quotations:", error);
          toast.error("Failed to load quotation requests");
          return;
        }

        // Set total pages
        if (count) {
          setTotalPages(Math.ceil(count / itemsPerPage));
        }
        
        // Get customer details for each quotation
        if (quotations && quotations.length > 0) {
          const quotationsWithCustomers = await Promise.all(
            quotations.map(async (quotation) => {
              // Get customer profile info
              const { data: customerData, error: customerError } = await supabase
                .from("customer_profiles")
                .select("first_name, last_name, email")
                .eq("id", quotation.customer_id)
                .single();
                
              if (customerError) {
                console.error("Error fetching customer:", customerError);
                return {
                  ...quotation,
                  customerName: "Unknown Customer",
                  customerEmail: ""
                };
              }
              
              // Check if the vendor has already submitted a proposal
              const { data: proposalData, error: proposalError } = await supabase
                .from("quotation_proposals")
                .select("id")
                .eq("quotation_request_id", quotation.id)
                .eq("vendor_id", user.id);
                
              const hasProposal = proposalData && proposalData.length > 0;
                
              return {
                ...quotation,
                customerName: `${customerData.first_name} ${customerData.last_name}`,
                customerEmail: customerData.email,
                hasProposal
              };
            })
          );
          
          setQuotationRequests(quotationsWithCustomers);
        } else {
          setQuotationRequests([]);
        }
      } catch (error) {
        console.error("Error fetching quotation data:", error);
        toast.error("Failed to load quotation requests");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotationRequests();
  }, [user, currentPage]);

  if (!user) return null;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status, hasProposal) => {
    if (hasProposal) {
      return <Badge className="bg-green-500">Quoted</Badge>;
    }
    
    switch (status) {
      case "pending":
        return <Badge className="bg-blue-500">New</Badge>;
      case "viewed":
        return <Badge className="bg-amber-500">Viewed</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">All Quotation Requests</h1>
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
        ) : quotationRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No quotation requests found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>All Customer Quotation Requests</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Monthly Bill</TableHead>
                      <TableHead>Roof Type</TableHead>
                      <TableHead>Roof Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotationRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.customerName}</TableCell>
                        <TableCell>{request.location}</TableCell>
                        <TableCell>{format(parseISO(request.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>${request.energy_usage || "N/A"}</TableCell>
                        <TableCell>{request.roof_type}</TableCell>
                        <TableCell>{request.roof_area} sq ft</TableCell>
                        <TableCell>{getStatusBadge(request.status, request.hasProposal)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">View Details</Button>
                            {!request.hasProposal && (
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
