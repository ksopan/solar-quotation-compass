
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldAlert } from "lucide-react";

interface EmptyStateCardProps {
  onRefresh: () => void;
  onCheckPermissions: () => void;
  onCreateSampleData: () => void;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  onRefresh,
  onCheckPermissions,
  onCreateSampleData
}) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="py-6">
        <div className="text-center">
          <h3 className="font-medium text-blue-800">No Questionnaires Found</h3>
          <p className="text-blue-600 mt-1">
            There are no property questionnaires available at this time.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button 
              variant="outline" 
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
            </Button>
            <Button 
              variant="outline" 
              onClick={onCheckPermissions}
            >
              <ShieldAlert className="h-4 w-4 mr-2" /> Check Permissions
            </Button>
            <Button 
              variant="default"
              onClick={onCreateSampleData}
            >
              Create Sample Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
