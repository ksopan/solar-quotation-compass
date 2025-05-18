
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useVendorQuotations } from "@/hooks/vendor";
import { DashboardStats } from "@/components/vendor/DashboardStats";
import { QuestionnaireFilters } from "@/components/vendor/QuestionnaireFilters";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { toast } from "sonner";
import { VendorDashboardHeader } from "@/components/vendor/VendorDashboardHeader";
import { VendorDashboardActions } from "@/components/vendor/VendorDashboardActions";
import { ErrorDisplay } from "@/components/vendor/ErrorDisplay";
import { EmptyStateCard } from "@/components/vendor/EmptyStateCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use the hook directly with a limit of 5 recent questionnaires
  const { 
    questionnaires, 
    loading, 
    stats, 
    fetchQuestionnaires,
    refresh,
    checkPermissions,
    error
  } = useVendorQuotations(user);

  // Log dashboard rendering
  useEffect(() => {
    console.log("VendorDashboard rendering with questionnaires:", questionnaires);
    console.log("VendorDashboard stats:", stats);
  }, [questionnaires, stats]);

  // Initial load - show 5 most recent questionnaires
  useEffect(() => {
    if (user) {
      // Explicitly fetch 5 most recent questionnaires
      fetchQuestionnaires(1, 5);
    }
  }, [user, fetchQuestionnaires]);

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

  const handleRefresh = () => {
    toast.info("Refreshing dashboard data...");
    refresh();
  };

  const handleCheckPermissions = () => {
    toast.info("Checking database permissions...");
    checkPermissions();
  };

  const handleShowAllQuestionnaires = () => {
    toast.info("Navigating to all questionnaires...");
    navigate("/all-questionnaires");
  };

  const handleCreateSampleData = async () => {
    if (!user) return;
    
    try {
      const { createSampleQuestionnaire } = await import('@/hooks/vendor/api');
      const result = await createSampleQuestionnaire(user.id);
      if (result) {
        // Refresh the data to show the new questionnaire
        refresh();
      }
    } catch (error) {
      console.error("Error creating sample data:", error);
      toast.error("Failed to create sample data");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <VendorDashboardHeader user={user} />
        <VendorDashboardActions 
          onRefresh={handleRefresh}
          onCheckPermissions={handleCheckPermissions}
          showAllQuestionnaires={handleShowAllQuestionnaires}
        />
      </div>

      <DashboardStats stats={stats} />

      {error && <ErrorDisplay error={error} />}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Property Questionnaires</h2>
        <Button 
          variant="outline" 
          onClick={handleShowAllQuestionnaires} 
          className="flex items-center"
        >
          View All Questionnaires <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <QuestionnairesTable 
        questionnaires={questionnaires}
        loading={loading}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
        showPagination={false}
      />
      
      {!loading && questionnaires.length === 0 && (
        <EmptyStateCard
          onRefresh={handleRefresh}
          onCheckPermissions={handleCheckPermissions}
          onCreateSampleData={handleCreateSampleData}
        />
      )}
    </div>
  );
};

export default VendorDashboard;
