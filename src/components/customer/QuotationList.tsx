
import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import QuotationDetails from "./QuotationDetails";

type QuotationItem = Database['public']['Tables']['quotation_requests']['Row'] & {
  quotation_proposals: { count: number }[];
};

interface QuotationListProps {
  quotations: QuotationItem[];
  loading: boolean;
  onRefresh?: () => void; // Optional: used to reload data after delete
}

export const QuotationList: React.FC<QuotationListProps> = ({ quotations, loading, onRefresh }) => {
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationItem | null>(null);

  const handleDeleteQuotation = async (id: string) => {
    const { error } = await supabase.from("quotation_requests").delete().eq("id", id);
    if (error) {
      alert("Failed to delete quotation.");
      console.error(error);
    } else {
      alert("Quotation deleted successfully.");
      setSelectedQuotation(null);
      onRefresh?.(); // Refresh the quotation list (if provided)
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proposals</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((quotation) => (
                  <TableRow key={quotation.id}>
                    <TableCell>{format(new Date(quotation.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>{quotation.location}</TableCell>
                    <TableCell>{getStatusBadge(quotation.status)}</TableCell>
                    <TableCell>{quotation.quotation_proposals?.length || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => setSelectedQuotation(quotation)}
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

      {/* Modal for details + delete */}
      <QuotationDetails
        quotation={selectedQuotation}
        isOpen={!!selectedQuotation}
        onClose={() => setSelectedQuotation(null)}
        onDelete={handleDeleteQuotation}
      />
    </>
  );
};


// import React from "react";
// import { format } from "date-fns";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Database } from "@/integrations/supabase/types";

// type QuotationItem = Database['public']['Tables']['quotation_requests']['Row'] & {
//   quotation_proposals: { count: number }[];
// };

// interface QuotationListProps {
//   quotations: QuotationItem[];
//   loading: boolean;
// }

// export const QuotationList: React.FC<QuotationListProps> = ({ quotations, loading }) => {
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     );
//   }

//   if (quotations.length === 0) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Your Quotation Requests</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-6">
//             <p className="text-muted-foreground">You haven't submitted any quotation requests yet.</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "pending":
//         return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
//       case "approved":
//         return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
//       case "rejected":
//         return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
//       default:
//         return <Badge variant="outline">{status}</Badge>;
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Your Quotation Requests</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Date</TableHead>
//                 <TableHead>Location</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Proposals</TableHead>
//                 <TableHead className="text-right">Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {quotations.map((quotation) => (
//                 <TableRow key={quotation.id}>
//                   <TableCell>{format(new Date(quotation.created_at), "MMM d, yyyy")}</TableCell>
//                   <TableCell>{quotation.location}</TableCell>
//                   <TableCell>{getStatusBadge(quotation.status)}</TableCell>
//                   <TableCell>{quotation.quotation_proposals?.length || 0}</TableCell>
//                   <TableCell className="text-right">
//                     <Button asChild size="sm">
//                       <Link to={`/quotation/${quotation.id}`}>View Details</Link>
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };
