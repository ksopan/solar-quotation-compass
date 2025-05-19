
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, DatabaseIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QuestionnairesTable } from "@/components/vendor/QuestionnairesTable";
import { PropertyQuestionnaireItem } from "@/hooks/vendor/types";

const AllQuestionnaires = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [allQuestionnaires, setAllQuestionnaires] = useState<PropertyQuestionnaireItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all questionnaires when the component mounts
  useEffect(() => {
    if (user) {
      loadAllQuestionnaires();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all questionnaires with pagination
  const loadAllQuestionnaires = async (page = 1) => {
    setIsLoading(true);
    setCurrentPage(page);
    
    try {
      // Use the fetchQuestionnaires function directly from the api module
      // to avoid any state conflicts with the hook
      const { fetchQuestionnaires } = await import('@/hooks/vendor/api');
      const result = await fetchQuestionnaires(user, page, 10); // Show 10 items per page
      
      if (result && result.questionnaires) {
        console.log(`Fetched ${result.questionnaires.length} questionnaires for page ${page}`);
        setAllQuestionnaires(result.questionnaires);
        setTotalPages(result.totalPages);
      } else {
        console.log("No questionnaires returned for all questionnaires page");
        setAllQuestionnaires([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error loading all questionnaires:", error);
      toast.error("Failed to load questionnaires");
      setAllQuestionnaires([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadAllQuestionnaires(page);
  };

  const handleRefresh = () => {
    toast.info("Refreshing all questionnaires...");
    loadAllQuestionnaires(currentPage);
  };

  // Toggle debug mode to use the RPC function directly
  const handleToggleDebugMode = async () => {
    if (!debugMode) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_debug_questionnaires');
        if (error) {
          throw error;
        }
        console.log("Debug RPC direct call returned:", data?.length || 0, "questionnaires");
        toast.success(`Debug mode: Found ${data?.length || 0} questionnaires directly from RPC`);
        if (data) {
          // Process the data to match our expected format
          const processedData = data.map(q => ({
            ...q,
            customerName: `${q.first_name} ${q.last_name}`,
            customerEmail: q.email,
            hasProposal: false // We don't know this in debug mode
          }));
          setAllQuestionnaires(processedData);
        }
        setDebugMode(true);
      } catch (error) {
        console.error("Error using debug RPC function:", error);
        toast.error("Failed to use debug mode");
      } finally {
        setIsLoading(false);
      }
    } else {
      setDebugMode(false);
      loadAllQuestionnaires(1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Property Questionnaires</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleDebugMode}>
            <DatabaseIcon className="h-4 w-4 mr-2" /> 
            {debugMode ? "Normal Mode" : "Debug Mode"}
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="sr-only">Loading...</span>
        </div>
      ) : (
        <QuestionnairesTable 
          questionnaires={allQuestionnaires}
          loading={false}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showPagination={true}
        />
      )}
      
      {!isLoading && allQuestionnaires.length === 0 && (
        <div className="text-center p-8">
          <p>No questionnaires found. The database may be empty or you may not have permission to view them.</p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      )}
    </div>
  );
};

export default AllQuestionnaires;
