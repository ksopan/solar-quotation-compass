
import React, { useState, useEffect } from "react";
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
import { ArrowRight, Loader2 } from "lucide-react";

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [recentQuestionnaires, setRecentQuestionnaires] = useState([]);
  
  // Use the hook for stats and utility functions
  const { 
    stats, 
    refresh,
    checkPermissions,
    fetchRecentQuestionnaires,
    error,
    loading: hookLoading
  } = useVendorQuotations(user);

  // Log dashboard rendering
  useEffect(() => {
    console.log("VendorDashboard rendering with recent questionnaires:", recentQuestionnaires);
    console.log("VendorDashboard stats:", stats);
  }, [recentQuestionnaires, stats]);

  // Initial load - show 5 most recent questionnaires
  useEffect(() => {
    if (user) {
      loadRecentQuestionnaires();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to fetch recent questionnaires
  const loadRecentQuestionnaires = async () => {
    if (!user) return;
    
    setIsLoadingRecent(true);
    try {
      console.log("Fetching recent questionnaires");
      const questionnaires = await fetchRecentQuestionnaires(5); // Explicitly request 5 items
      setRecentQuestionnaires(questionnaires);
      console.log("Fetched recent questionnaires:", questionnaires.length);
    } catch (error) {
      console.error("Error loading recent questionnaires:", error);
      toast.error("Failed to fetch recent questionnaires");
    } finally {
      setIsLoadingRecent(false);
    }
  };

  useEffect(() => {
    // Initial load - show toast with help if no data found
    if (!isLoadingRecent && recentQuestionnaires.length === 0) {
      toast.info("No questionnaires found. Check permissions or try refreshing.");
    }
  }, [isLoadingRecent, recentQuestionnaires]);

  if (!user) {
    toast.error("User not authenticated");
    return null;
  }

  const handleRefresh = () => {
    toast.info("Refreshing dashboard data...");
    refresh();
    loadRecentQuestionnaires();
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
        toast.success("Sample questionnaire created");
        // Refresh the data to show the new questionnaire
        loadRecentQuestionnaires();
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
      
      {isLoadingRecent ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="sr-only">Loading...</span>
        </div>
      ) : (
        <QuestionnairesTable 
          questionnaires={recentQuestionnaires}
          loading={false}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          showPagination={false}
        />
      )}
      
      {!isLoadingRecent && recentQuestionnaires.length === 0 && (
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
