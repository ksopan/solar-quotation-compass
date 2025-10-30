
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuotationItem } from "@/hooks/useCustomerQuotations";

interface DashboardStatsProps {
  quotations: QuotationItem[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ quotations }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quotations.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Completed Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {quotations.filter(q => q.is_completed).length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Received Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {quotations.reduce((total, q) => total + (q.quotation_proposals?.length || 0), 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
