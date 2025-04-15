
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { useVendorQuotations } from "@/hooks/vendor";
import { DashboardStats } from "@/components/vendor/DashboardStats";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

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
    refresh
  } = useVendorQuotations(user);

  // Log dashboard rendering
  useEffect(() => {
    console.log("VendorDashboard rendering with questionnaires:", questionnaires);
    console.log("VendorDashboard stats:", stats);
  }, [questionnaires, stats]);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user.companyName || 'Vendor'}!</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => navigate("/quotation-requests")}>View All Requests</Button>
        </div>
      </div>

      <DashboardStats stats={stats} />

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
    </div>
  );
};

export default VendorDashboard;
