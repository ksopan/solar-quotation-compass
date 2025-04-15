import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { useVendorQuotations } from "@/hooks/vendor";
import { DashboardStats } from "@/components/vendor/DashboardStats";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RefreshCw, ShieldAlert, AlertCircle, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createSampleQuestionnaire } from "@/hooks/vendor/api";

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use the hook directly
  const { 
    questionnaires, 
    loading, 
    stats, 
    fetchQuestionnaires, 
    currentPage, 
    totalPages,
    refresh,
    checkPermissions,
    error
  } = useVendorQuotations(user);

  // Log dashboard rendering
  useEffect(() => {
    console.log("VendorDashboard rendering with questionnaires:", questionnaires);
    console.log("VendorDashboard stats:", stats);
  }, [questionnaires, stats]);

  useEffect(() => {
    // Initial load - show toast with help if no data found
    if (!loading && questionnaires.length === 0) {
      toast.info("No questionnaires found. Check permissions or try refreshing.");
    }
  }, [loading, questionnaires]);

  if (!user) {
    toast.error("User not authenticated");
    return null;
  }

  const handlePageChange = (page: number) => {
    fetchQuestionnaires(page, 5); // Show fewer items on dashboard
  };

  const handleRefresh = () => {
    toast.info("Refreshing dashboard data...");
    refresh();
  };

  const handleCheckPermissions = () => {
    toast.info("Checking database permissions...");
    checkPermissions();
  };

  const handleCreateSampleData = async () => {
    if (!user) return;
    
    const result = await createSampleQuestionnaire(user.id);
    if (result) {
      // Refresh the data to show the new questionnaire
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user.companyName || 'Vendor'}!</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCheckPermissions}>
            <ShieldAlert className="h-4 w-4 mr-2" /> Check Permissions
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => navigate("/quotation-requests")}>View All Requests</Button>
        </div>
      </div>

      <DashboardStats stats={stats} />

      {error && (
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
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Property Questionnaires</h2>
        <QuestionnaireFilters />
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
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCheckPermissions}
                >
                  <ShieldAlert className="h-4 w-4 mr-2" /> Check Permissions
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
  );
};

export default VendorDashboard;
