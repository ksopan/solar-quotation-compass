
import React, { useEffect, useState } from "react";
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

const VendorDashboard = () => {
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);
  
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

  useEffect(() => {
    // Fetch all questionnaires if showAll is true
    if (showAll) {
      fetchQuestionnaires(1, 100); // Show up to 100 items when viewing all
    }
  }, [showAll, fetchQuestionnaires]);

  if (!user) {
    toast.error("User not authenticated");
    return null;
  }

  const handlePageChange = (page: number) => {
    if (!showAll) {
      fetchQuestionnaires(page, 5); // Show fewer items on dashboard when paginated
    }
  };

  const handleRefresh = () => {
    toast.info("Refreshing dashboard data...");
    refresh();
  };

  const handleCheckPermissions = () => {
    toast.info("Checking database permissions...");
    checkPermissions();
  };

  const handleShowAllQuestionnaires = () => {
    setShowAll(true);
    toast.info("Loading all questionnaires...");
    fetchQuestionnaires(1, 100); // Fetch up to 100 questionnaires
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
        <h2 className="text-xl font-semibold">
          {showAll ? "All Property Questionnaires" : "Recent Property Questionnaires"}
        </h2>
        <QuestionnaireFilters />
      </div>
      
      <QuestionnairesTable 
        questionnaires={questionnaires}
        loading={loading}
        currentPage={currentPage}
        totalPages={showAll ? 1 : totalPages}
        onPageChange={handlePageChange}
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
