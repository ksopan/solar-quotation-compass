
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database } from "lucide-react";
import { viewPropertyQuestionnaires } from "@/hooks/vendor/api/debugDatabaseView";

export const DatabaseDebugView: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleViewData = async () => {
    setLoading(true);
    try {
      const data = await viewPropertyQuestionnaires();
      setQuestionnaires(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-slate-800 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Debug View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleViewData} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-20 border-t-white"></span>
                Loading...
              </span>
            ) : (
              "View property_questionnaires Table"
            )}
          </Button>
          
          {questionnaires && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Found {questionnaires.length} Records:</h3>
              <ScrollArea className="h-[400px] rounded border p-4 bg-white">
                <pre className="text-xs">{JSON.stringify(questionnaires, null, 2)}</pre>
              </ScrollArea>
              <p className="text-xs text-muted-foreground mt-2">
                Check browser console for more details
              </p>
            </div>
          )}
          
          {questionnaires !== null && questionnaires.length === 0 && (
            <div className="py-4 text-center text-amber-600">
              No questionnaire records found in the database
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
