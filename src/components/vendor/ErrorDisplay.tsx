
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="pt-6">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Data</h3>
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-red-500 mt-1">Try refreshing or checking permissions.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
