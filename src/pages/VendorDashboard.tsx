
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { useVendorQuotations } from "@/hooks/vendor";
import { DashboardStats } from "@/components/vendor/DashboardStats";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RefreshCw, ShieldAlert, AlertCircle, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSampleQuestionnaire, viewPropertyQuestionnaires } from "@/hooks/vendor/api";

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dbData, setDbData] = useState<any[] | null>(null);
  
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
    
    // Automatically fetch database data for debugging
    handleViewDatabaseData();
  }, [loading, questionnaires]);

  if (!user) {
    toast.error("User not authenticated");
    return null;
  }

  const handleViewDatabaseData = async () => {
    try {
      const data = await viewPropertyQuestionnaires();
      setDbData(data);
      console.log("Database raw data loaded:", data);
    } catch (error) {
      console.error("Error fetching database data:", error);
    }
  };

  const handlePageChange = (page: number) => {
    fetchQuestionnaires(page, 5); // Show fewer items on dashboard
  };

  const handleRefresh = () => {
    toast.info("Refreshing dashboard data...");
    refresh();
    handleViewDatabaseData();
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
      handleViewDatabaseData();
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
      
      {/* Database Table View Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Property Questionnaires Raw Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                Showing raw property questionnaires from database
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewDatabaseData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
            
            {dbData ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="px-4 py-2 text-left font-medium">ID</th>
                      <th className="px-4 py-2 text-left font-medium">Name</th>
                      <th className="px-4 py-2 text-left font-medium">Email</th>
                      <th className="px-4 py-2 text-left font-medium">Property Type</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                      <th className="px-4 py-2 text-left font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbData.length > 0 ? (
                      dbData.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="px-4 py-2 font-mono text-xs">{item.id.substring(0, 8)}...</td>
                          <td className="px-4 py-2">{item.first_name} {item.last_name}</td>
                          <td className="px-4 py-2">{item.email}</td>
                          <td className="px-4 py-2">{item.property_type}</td>
                          <td className="px-4 py-2">
                            {item.is_completed ? 
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Complete</span> : 
                              <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Incomplete</span>
                            }
                          </td>
                          <td className="px-4 py-2">{new Date(item.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No questionnaire records found in database
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {dbData && dbData.length === 0 && (
              <div className="text-center py-4">
                <Button 
                  onClick={handleCreateSampleData}
                >
                  <Database className="h-4 w-4 mr-2" /> Create Sample Data
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
