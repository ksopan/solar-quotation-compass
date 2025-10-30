
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth";
import { MainLayout } from "@/components/layouts/MainLayout";
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
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  
  // Use the hook for dashboard stats only
  const { 
    stats, 
    refresh,
    checkPermissions,
    error
  } = useVendorQuotations(user);

  // Separate state for recent questionnaires
  const [recentQuestionnaires, setRecentQuestionnaires] = useState([]);
  
  // Log dashboard rendering
  useEffect(() => {
    console.log("VendorDashboard rendering with recent questionnaires:", recentQuestionnaires);
    console.log("VendorDashboard stats:", stats);
  }, [recentQuestionnaires, stats]);

  // Function to fetch recent questionnaires
  const fetchRecentQuestionnaires = async () => {
    if (!user) return;
    
    try {
      setIsLoadingRecent(true);
      console.log("Fetching recent questionnaires");
      
      // Import the fetch function directly to avoid hooks dependency issues
      const { fetchQuestionnaires } = await import('@/hooks/vendor/api');
      const result = await fetchQuestionnaires(user, 1, 5); // Explicitly request 5 items
      
      if (result && result.questionnaires) {
        console.log("Fetched recent questionnaires:", result.questionnaires.length);
        setRecentQuestionnaires(result.questionnaires);
      } else {
        setRecentQuestionnaires([]);
      }
    } catch (error) {
      console.error("Error fetching recent questionnaires:", error);
      toast.error("Failed to fetch recent questionnaires");
      setRecentQuestionnaires([]);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  // Initial load - show 5 most recent questionnaires
  useEffect(() => {
    if (user) {
      fetchRecentQuestionnaires();
    }
  }, [user]);

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
    fetchRecentQuestionnaires();
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
        fetchRecentQuestionnaires();
        refresh();
      }
    } catch (error) {
      console.error("Error creating sample data:", error);
      toast.error("Failed to create sample data");
    }
  };

  return (
    <MainLayout>
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
          questionnaires={recentQuestionnaires}
          loading={isLoadingRecent}
          currentPage={1}
          totalPages={1}
          onPageChange={() => {}}
          showPagination={false}
        />
        
        {!isLoadingRecent && recentQuestionnaires.length === 0 && (
          <EmptyStateCard
            onRefresh={handleRefresh}
            onCheckPermissions={handleCheckPermissions}
            onCreateSampleData={handleCreateSampleData}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default VendorDashboard;
