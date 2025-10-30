import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PropertyQuestionnaireItem } from "@/hooks/vendor/types";
import { format } from "date-fns";

interface RecentActivityProps {
  questionnaires: PropertyQuestionnaireItem[];
  loading: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ questionnaires, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest customer requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentItems = questionnaires.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest customer requests</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/quotation-requests")}>
          View All <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {recentItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/quotation-requests")}
            >
              Browse Requests
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                onClick={() => navigate(`/questionnaire/${item.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">
                      {item.customerName || `${item.first_name} ${item.last_name}`}
                    </p>
                    {item.hasProposal && (
                      <Badge variant="secondary" className="text-xs">
                        Quoted
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{item.property_type}</span>
                    <span>•</span>
                    <span>${item.monthly_electric_bill}/mo bill</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(item.created_at), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
