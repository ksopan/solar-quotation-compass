
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Database, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVendorQuotations, PropertyQuestionnaireItem } from "@/hooks/vendor";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { createSampleQuestionnaire } from "@/hooks/vendor/api";

const QuotationRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use the hook directly
  const { 
    questionnaires, 
    loading, 
    fetchQuestionnaires, 
    stats, 
    refresh, 
    currentPage, 
    totalPages,
    error
  } = useVendorQuotations(user);
  
  // Log rendering
  useEffect(() => {
    console.log("QuotationRequests rendering with questionnaires:", questionnaires);
  }, [questionnaires]);

  if (!user) {
    toast.error("User not authenticated");
    return null;
  }

  const handlePageChange = (page: number) => {
    fetchQuestionnaires(page, 15);
  };

  const handleRefresh = () => {
    toast.info("Refreshing questionnaire data...");
    refresh();
  };

  const handleCreateSampleData = async () => {
    if (!user) return;
    
    const result = await createSampleQuestionnaire(user.id);
    if (result) {
      // Refresh the data to show the new questionnaire
      toast.success("Sample questionnaire created successfully. Refreshing data...");
      refresh();
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
            <h1 className="text-3xl font-bold">All Property Questionnaires</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
        </div>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-4">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        <QuestionnairesTable 
          questionnaires={questionnaires}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        
        {!loading && questionnaires.length === 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-6">
              <div className="text-center">
                <h3 className="font-medium text-blue-800">No Questionnaires Found</h3>
                <p className="text-blue-600 mt-1">
                  There are no property questionnaires available at this time.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
                  </Button>
                  <Button 
                    variant="default"
                    onClick={handleCreateSampleData}
                  >
                    <Database className="h-4 w-4 mr-2" /> Create Sample Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default QuotationRequests;
