
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVendorQuotations, PropertyQuestionnaireItem } from "@/hooks/vendor";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

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
    totalPages
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
    try {
      toast.info("Creating sample questionnaire data...");
      
      // Call the RPC function to create a sample questionnaire
      // Fix: Correctly type the parameters object
      const { data, error } = await supabase
        .rpc('insert_sample_questionnaire', { vendor_id: user.id });
        
      if (error) {
        console.error("Error creating sample data:", error);
        toast.error("Failed to create sample data: " + error.message);
        return;
      }
      
      console.log("Sample data created with ID:", data);
      toast.success("Sample questionnaire created successfully!");
      
      // Refresh the data to show the new questionnaire
      refresh();
    } catch (err) {
      console.error("Exception creating sample data:", err);
      toast.error("An unexpected error occurred");
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
            <QuestionnaireFilters />
          </div>
        </div>

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
